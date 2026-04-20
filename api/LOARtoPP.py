import os
import argparse
import configparser
import pyodbc
import urllib.request
import json
import smtplib
import requests
import warnings
import logging
from logging import StreamHandler
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from pathlib import Path

LEAVE_TYPES = ['Vacation', 'Sick', 'FamilySick', 
              'Travel', 'Holiday', 'Other', 'WFH']

DATE_FORMAT = "%Y-%m-%d"
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"

# Load configuration
config_path = Path(__file__).parent / 'config.live.ini'
config = configparser.ConfigParser()
config.read(config_path) 

def get_loar_data():
    """Connect to Microsoft SQL database and retrieve LOAR data."""
    try:
        dsn = config.get('loar', 'odbc_dsn')
        uid = config.get('loar', 'odbc_user')
        pwd = config.get('loar', 'odbc_password')
        lconn = pyodbc.connect(f'DSN={dsn};UID={uid};PWD={pwd}')
    except Exception as e:
        logging.error(f'Could not connect to LOAR database: {e}')
        print(f'Could not connect to LOAR database: {e}')
        exit(1)

    # Get recent LOAR submissions
    lcursor = lconn.cursor()
    lcursor.execute('select * from tblLOAR where PCALStatus=0')
    #for testing purposes
    #lcursor.execute('select * from tblLOAR')

    # Get column names
    columns = [column[0] for column in lcursor.description]

    # Loop through and save information
    num = 0
    data = []
    try:
        for row in lcursor:
            if row.EmpID.strip() == '': 
                continue
            loar = dict(zip(columns, row))
            # Skip old entries
            if loar['FromDate'] < datetime.strptime('2023-01-01', '%Y-%m-%d'):
                continue
            data.append(loar)
            num += 1
    except Exception as e:
        logging.error(f'Error processing LOAR data: {e}')
        lconn.close()
        exit(1)
    return data, lconn, lcursor

def add_loar_to_p_squared(idx, count, loar, lconn, lcursor, message):
    fdate = loar['FromDate'].strftime('%Y-%m-%d')
    tdate = loar['ToDate'].strftime('%Y-%m-%d')
    rtw = loar['RTWDate'].strftime('%Y-%m-%d')

    # Get information for the employee
    try:
        eid = str(loar['EmpID']).strip().lstrip('0')
        if not eid or not eid.isdigit():
            message = ''.join((message, '\t[ERROR] Invalid Employee ID\n'))
            return message, count
        
        url = f'https://www.keck.hawaii.edu/software/db_api/telSchedule.php?cmd=getEmployee&eid={eid}'
        response = urllib.request.urlopen(url)
        emp = response.read().decode('utf8')
        emp = json.loads(emp)
    except Exception as e:
        message = ''.join((message, f'\t[ERROR] Could not fetch employee data: {e}\n'))
        logging.error(f'Error fetching employee for EID {loar["EmpID"]}: {e}')
        return message, count

    message = ''.join((message, 'LOAR ID = ', str(loar['spLOARID']), '\n'))
    message = ''.join((message, 'Status = -', loar['Status'], '-\n'))
    message = ''.join((message, 'Employee ID = ', loar['EmpID'], '\n'))
    message = ''.join((message, 
                       'Leave Type = ', str(loar['spAbsenceID']), '\n'))
    message = ''.join((message, 'LOAR Dates = '))
    message = ''.join((message, fdate, ' to '))
    message = ''.join((message, tdate, ' '))
    message = ''.join((message, '(return to work on ', rtw, ')\n'))
    approval = loar['LastModifiedBy'].strip().replace('KECK-NT', '')
    message = ''.join((message, 'Approved By = ', approval, '\n'))

    if len(emp) == 0:
        message = ''.join((message, '\tEmployee not found\n'))
        return message, count
    emp = emp[0]
    message = ''.join((message, '\t', emp['LastName'], ', '))
    message = ''.join((message, emp['FirstName'], '\n'))

    entries = entries_in_p_squared(emp, loar, fdate, tdate)

    if loar['spTotalHours'] > 0 and loar['spTotalHours'] <= 4:
        msg = f"\tEntry dt={loar['spTotalHours']} hours. not to add\n"
        message = ''.join((message, msg))
        message, count = update_tbl_loar(count, loar, lcursor, message)
        return message, count

    if not 'Cancel' in loar['Status']:
        message, count = insert_loar_into_p_squared(idx, 
                                                    count, 
                                                    loar, 
                                                    emp, 
                                                    fdate, 
                                                    tdate, 
                                                    rtw, 
                                                    approval, 
                                                    message)
        message, count = update_tbl_loar(count, loar, lcursor, message)
        return message, count
    else:
        existingEntries = find_entry_by_username_and_daterange(emp, 
                                                               fdate, 
                                                               tdate)
        for ent in existingEntries:
            message = delete_entry_in_p_squared(message, ent)
    message, count = update_tbl_loar(count, loar, lcursor, message)
    return message, count

def entries_in_p_squared(emp, loar, fdate, tdate):
    """Retrieves entries for employee id, fromdate, and todate."""
    data = find_entry_by_username_and_daterange(emp, fdate, tdate)
    entries = []
    for entry in data:
        loarInPSquared = entry.get('Alias') == STAFF_NAME 
        if loarInPSquared:
            entries.append(entry)
    return entries 

def delete_entry_in_p_squared(message, entry):
    message = ''.join((message, '\tdeleting entry in p-squared\n'))
    resp = delete_p_squared_entry_by_id(entry['id'])
    status = resp['apiCode']
    message = ''.join((message, f'\tp-squared delete status: {status}\n'))
    return message 

def update_tbl_loar(count, loar, lcursor, message):
    """Update tblLOAR status using parameterized query."""
    try:
        # Validate spLOARID
        loar_id = loar.get('spLOARID')
        if not loar_id or not isinstance(loar_id, (int, str)):
            message = ''.join((message, '\t[ERROR] Invalid LOAR ID\n'))
            return message, count
        
        # Use parameterized query to prevent SQL injection
        query = 'UPDATE tblLOAR SET PCALStatus=1, LastModifiedBy=? WHERE spLOARID=?'
        lcursor.execute(query, ('psquaredUpdate', loar_id))
        lcursor.commit()
        count += 1
        message = ''.join((message, '\tUpdated tblLOAR status\n'))
    except Exception as e:
        message = ''.join((message, f'\t[ERROR] Failed to update tblLOAR: {e}\n'))
        logging.error(f'Error updating tblLOAR for spLOARID {loar.get("spLOARID")}: {e}')
    return message, count

def loar_to_entries(idx, loar, emp, fdate, tdate, rtw):
    leaveDesc = loar['LeaveDescrip'] #
    if not isinstance(leaveDesc, str):
        leaveDesc = "" 
    comment = "From LOAR. " + leaveDesc.lstrip(" ")
    now = datetime.now()
    baseEntry = {
        "Name": emp['LastName'] + ', ' + emp['FirstName'],
        #"Alias": emp['Alias'],
        "Alias": emp['Alias'],
        "Department": emp['Department'],
        "Comment": comment,
        "BaseCamp": emp['BaseCamp'],
        "CreationTime": now.strftime(DATETIME_FORMAT),
        "Staff": STAFF_NAME 
    }

    entries = []
    try:
        location = LEAVE_TYPES[loar['LeaveType']]
        start = datetime.strptime(fdate, DATE_FORMAT)
        end = datetime.strptime(tdate, DATE_FORMAT)
        datesGenerated = [start + timedelta(days=x) for x in
                          range( (end-start).days + 1 ) ]
        for date in datesGenerated: # weekend and holidays have entries
            dateStr = date.strftime(DATE_FORMAT)
            entry = {**baseEntry}
            entry["Date"] =  dateStr, 
            timerange = str([ dateStr + " 08:00:00", 
                              dateStr + " 17:00:00"])
            entry[location] = timerange.replace('\'', '\"')
            entries.append(entry)
    except IndexError as err:
        print('index error', err, 'loar leave type', loar['LeaveType'])
        logging.warning(f"index error: {err} on idx: {idx} loar leave type: {loar['LeaveType']}")

    return entries

def get_holidays(fdate, tdate):
    url = URL_BASE + 'holidays?'
    url += f"startdate={fdate}"
    url += f"&enddate={tdate}"
    resp = requests.get(url, verify=False)
    holidayList = resp.json()
    return holidayList  

def find_entry_by_username_and_daterange(emp, fdate, tdate):
    """Retrieve entries from p-squared API with validation."""
    try:
        # Validate inputs
        eid = emp.get('EId')
        if not eid or not str(eid).isdigit():
            logging.warning(f'Invalid EId provided: {eid}')
            return []
        
        url = URL_BASE + "entryByEId?"
        url += f"eid={eid}"
        url += f"&startdate={fdate}"
        url += f"&enddate={tdate}"
        resp = requests.get(url, verify=True, timeout=10)
        resp.raise_for_status()
        respJson = resp.json()
        data = respJson.get('data', [])
        return data
    except Exception as e:
        logging.error(f'Error retrieving entries for EId {emp.get("EId")}: {e}')
        return [] 

def delete_p_squared_entry_by_id(id):
    """Delete entry from p-squared with validation and error handling."""
    try:
        # Validate ID
        if not id or not str(id).isdigit():
            logging.warning(f'Invalid entry ID provided: {id}')
            return {'apiCode': 'ERROR', 'message': 'Invalid ID'}
        
        url = URL_BASE + "entryById?"
        url += f"id={id}"
        resp = requests.delete(url, verify=True, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.error(f'Error deleting entry with ID {id}: {e}')
        return {'apiCode': 'ERROR', 'message': str(e)}

def add_p_squared_entry(idx, entry):
    """Add entry to p-squared with validation and error handling."""
    try:
        # Validate entry contains required fields
        required_fields = ['Date', 'Name', 'Department']
        if not all(field in entry for field in required_fields):
            logging.warning(f'Entry missing required fields at idx: {idx}')
            return {'apiCode': 'ERROR', 'message': 'Missing required fields'}
        
        url = URL_BASE + "entryById"
        resp = requests.post(url, data=entry, verify=True, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.error(f'Error adding entry for idx {idx}: {e}')
        return {'apiCode': 'ERROR', 'message': str(e)}

def insert_loar_into_p_squared(idx, count, loar, emp, fdate, tdate, rtw, approval, message):
    entries = loar_to_entries(idx, loar, emp, fdate, tdate, rtw)
    existingEntries = find_entry_by_username_and_daterange(emp, fdate, tdate)
    for ent in existingEntries:
        resp = delete_p_squared_entry_by_id(ent['id'])

    add_responses = []
    for x in entries:
        resp = add_p_squared_entry(idx, x)
        add_responses.append(resp)

    message = ''.join((message, '\tAdding entry to p-squared\n'))
    message = ''.join((message, '\t', str(entries), '\n'))
    message = ''.join((message, '\tAPI response\n'))
    for add_response in add_responses:
        if add_response.get("apiCode", False) == 'SUCESS':
            count += 1 # count if entry was added
        message = ''.join((message, '\t', add_response.get("message", "No message found."), '\n'))
    return message, count

def cleanup(lconn, lcursor):
    # Cleanup odbc connection
    lcursor.close()
    lconn.close()

def add_loar_data_to_p_squared(loars, lconn, lcursor, message=''):
    count = 0
    for idx, loar in enumerate(loars):
        try: 
            message, count = add_loar_to_p_squared(idx, count, loar, lconn, lcursor, message)
        except Exception as err:
            print(f'did not add loar {loar}')
            print(f'err: {err}')
    cleanup(lconn, lcursor)
    return message

def send_message(message):
    """Send email notification using config settings."""
    try:
        from_addr = config.get('email', 'from_address', fallback='ttucker@keck.hawaii.edu')
        to_addr = config.get('email', 'to_address', fallback='ttucker@keck.hawaii.edu')
        smtp_server = config.get('email', 'smtp_server', fallback='localhost')
        
        msg = MIMEText(message)
        msg['Subject'] = 'LOAR Submission'
        msg['To'] = to_addr
        msg['From'] = from_addr
        
        s = smtplib.SMTP(smtp_server)
        s.send_message(msg)
        s.quit()
    except Exception as e:
        logging.error(f'Error sending email: {e}')

def create_logger(fileName="LOARtoPP.log"):
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch = StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(fileName)
    logger = logging.getLogger()
    logger.addHandler(ch)
    logger.setLevel(logging.INFO)
    return logger

if __name__=='__main__':
    logger = create_logger()
    os.environ['ODBCINI'] = '/home/kcron/bin/crons/LOAR/odbc.ini'
    parser = argparse.ArgumentParser(description="Setup websocket host")
    parser.add_argument('--debug', type=bool, required=False, default=False, help="set debug to send to test database")
    args = parser.parse_args()
    warnings.filterwarnings("ignore")
    loars, lconn, lcursor = get_loar_data()
    debugMode = args.debug 

    #URL_BASE = "https://www3.keck.hawaii.edu/api/pp/"
    URL_BASE = "https://vm-appserver/api/pp/"
    if debugMode:
        print('in debug mode, going to www3build')
        #URL_BASE = "https://www3build.keck.hawaii.edu/api/pp/"
        URL_BASE = "https://vm-appserver.keck.hawaii.edu/api_test/pp/"

    STAFF_NAME = 'LOAR_to_PSquared'
    logger.debug('starting LOARtoPP.py')
    logger.debug(f'number of Loars: {len(loars)}')
    if len(loars) > 0:
        message = add_loar_data_to_p_squared(loars, lconn, lcursor)
        if message:
            send_message(message)
