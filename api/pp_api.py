#!/usr/local/anaconda/bin/python

import argparse
import ast
import configparser
import datetime as DT
import json
import pymysql
import pymysql.cursors
import subprocess
from flask import Flask, request
from os import path
from os.path import isfile
from flask_cors import CORS

app = Flask(__name__)

# Load configuration from config.live.ini
myPath = path.dirname(path.realpath(__file__))
config_file = path.join(myPath, 'config.live.ini')
config = configparser.ConfigParser()
config.read(config_file)
CORS(app,
     support_credentials=True,
     resources={r"*": {"origins":["https://www3build.keck.hawaii.edu",
                                  "https://www3.keck.hawaii.edu"],
                       "allow_headers":"*",
                       "expose_headers":"*"
               }})



class PpApi:
    """
    Class to control access to the people portal database information for
    admins.
    """
    def __init__(self, callType, call):
        myPath = path.dirname(path.realpath(__file__)).replace("/usr/local", "")
        self.dev = 0 if myPath.startswith("/api/") else 1

        args = request.args
        self.keckAlias = args.get("keckAlias")

        self.ppid = args.get("id")

        # A list of record fields, types, and default values
        # New fields should only need to be added here 
        self.pp_columns = [
                            ('Date', 'str', 'not null'),
                            ('Alias', 'str', ''),
                            ('Name', 'str', 'not null'),
                            ('Department', 'str', 'not null'),
                            ('BaseCamp', 'str', 'not null'),
                            ('HQ', 'str', '[]'),
                            ('SU', 'str', '[]'),
                            ('NgtSup', 'str', '[]'),
                            ('HP', 'str', '[]'),
                            ('Hilo', 'str', '[]'),
                            ('Kona', 'str', '[]'),
                            ('WFH', 'str', '[]'),
                            ('Remote', 'str', '[]'),
                            ('Vacation', 'str', '[]'),
                            ('Sick', 'str', '[]'),
                            ('FamilySick', 'str', '[]'),
                            ('JuryDuty', 'str', '[]'),
                            ('Bereavement', 'str', '[]'),
                            ('Travel', 'str', '[]'),
                            ('Flex', 'str', '[]'),
                            ('OffSite', 'str', '[]'),
                            ('Other', 'str', '[]'),
                            ('Comment', 'str', ''),
                            ('Staff', 'str', 'not null'),
                            ('CreationTime', 'datetime', 'not null'),
                            ('AlternatePickup', 'str', ''),
                            ('SummitLead', 'str', ''),
                            ('SupportLead', 'str', ''),
                            ('CrewLead', 'str', '0'),
                            ('Seats', 'str', '0')
                        ]

        # Additional allowed search parameters
        # value = search by that value
        # 1 = not empty search
        self.allowed_search = [
#            ('Department', 'value'),
            ('HQ', 1),
            ('SU', 1),
            ('NgtSup', 1),
            ('HP', 1),
            ('Hilo', 1),
            ('Kona', 1),
            ('WFH', 1),
            ('Remote', 1),
            ('Travel', 1),
            ('Flex', 1),
            ('OffSite', 1),
            ('JuryDuty', 1),
            ('Vacation', 1),
            ('leave', 1)
        ]

        # Leave type searches
        self.leave_search = [
            'Sick',
            'FamilySick',
            'Vacation',
            'Bereavement',
            'Flex',
            'JuryDuty'
        ]

        # association of people portal calls for admins only
        self.ppadmin = {
            "delEntryById": self.delete_pp_entry_by_id,
            "addEntry": self.insert_pp_entry,
            "putEntryById": self.update_pp_entry_by_id
        }

        # association of people portal calls for all
        self.ppobs = {
            "getEntryById": self.get_pp_entry_by_id,
            "getEntryByRange": self.get_pp_entry_by_date_range,
            "getEntryByEId": self.get_pp_entry_by_eid,
            "getEmployees": self.get_all_employees
        }

        # Shifts by code for NA/OA (start, end, location, overlap)
        self.oaNaShifts = {
            'sa': ['16:00:00', '11:00:00', 'NgtSup', True],
            'saoc': ['16:00:00', '11:00:00', 'NgtSup', True],
            'oa': ['sunset', 'sunrise', 'SU', True],
            'oao': ['sunset', '00:00:00', 'SU', True],
            'oar': ['sunset', 'sunrise', 'HQ', True],
            'oaro': ['sunset', '00:00:00', 'HQ', True],
            'oat': ['sunset', 'sunrise', 'SU', True],
            'oato': ['sunset', '00:00:00', 'SU', True],
            'na': ['17:30:00', '01:30:00', 'SU', True],
            'na1': ['18:00:00', '01:00:00', 'SU', True],
            'na2': ['23:00:00', '06:00:00', 'SU', True],
            'nah': ['17:30:00', '07:00:00', 'SU', True],
            'nah1': ['17:30:00', '01:00:00', 'SU', True],
            'nah2': ['23:30:00', '07:00:00', 'SU', True]
        }
        # set up connection and output variables to track status
        self.conn = ""
        self.metricsConn = ""
        self.output = {"apiCode": None}

        self.searchById = 0
        if self.ppid: self.searchById = 1

        self.connect_db()

        # if we successfully connect to the database execute the given call
        if self.output["apiCode"] == None:
            if callType == 'ppadmin':
                self.ppadmin[call]()
            elif callType == 'ppobs':
                self.ppobs[call]()

        self.close_db()

    def connect_db(self):
        """
        Create the database connection
        """

        dbList = config['db']['hosts'].split(',')

        dbuser = config['db']['user']
        dbpwd = config['db']['password']
        db = config['db']['name']
        metricsdbuser = config['metricsdb']['user']
        metricsdbpwd = config['metricsdb']['password']
        metricsdb = config['metricsdb']['name']
        dbhost = None

        if self.dev:
            dbhost = config['dev']['host']
        else:
            for server in dbList:
                cmd = ["timeout", "0.5", "ping", server]
                try:
                    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
                    p.wait()
                    if len(p.stdout.readlines()) > 0:
                        dbhost = server
                        break
                except:
                    pass

        if dbhost == None:
            self.output["apiCode"] = "DATABASE_ERROR"
            return

        self.conn = pymysql.connect(host=dbhost, user=dbuser, password=dbpwd, database=db, cursorclass=pymysql.cursors.DictCursor)
        self.cursor = self.conn.cursor()
        self.metricsConn = pymysql.connect(host=dbhost, user=metricsdbuser, password=metricsdbpwd, database=metricsdb, cursorclass=pymysql.cursors.DictCursor)
        self.metricsCursor = self.metricsConn.cursor()

    def close_db(self):
        """
        Close the database connection
        """

        if self.conn:
            self.cursor.close()
            self.conn.close()
        if self.metricsConn:
            self.metricsCursor.close()
            self.metricsConn.close()

    def do_query(self, query, colVal=None):
        """
        Sends database query.
        If colVal is present, send with SQL injection protection.
        """

        # send query
        try:
            if colVal != None:
                num = self.cursor.execute(query, colVal)
            else:
                num = self.cursor.execute(query)
        except pymysql.Error as e:
            num = -1
            self.output["apiCode"] = "DATABASE_ERROR"
            self.output["error"] = e.args[1]
            self.output["message"] = query

        return num

    def get_metrics(self, date):
        """
        Returns the sunset/rise hours for the supplied date.
        """

        query = 'SELECT * FROM twilight where udate=%s'
        num = self.metricsCursor.execute(query, (date,))
        if num != -1:
            result = self.metricsCursor.fetchone()
            sunset = result['sunset'].seconds//3600 - 10
            if sunset < 0:
                sunset = sunset + 24
            sunrise = result['sunrise'].seconds//3600 - 10
            if sunrise < 0:
                sunrise = sunrise + 24
            metrics = {}
            metrics['sunset']  = sunset
            metrics['sunrise'] = sunrise
            return metrics
        return None

    def get_pp_entry_by_id(self):
        """
        Returns the people portal entry for a given Id
        """
        args = request.args
        id = args.get("id", 0)

        query = 'SELECT * FROM peoplePortal WHERE id=%s AND DelFlag=0;'
        result = self.do_query(query, (id))
        if result != -1:
            self.output['data'] = self.cursor.fetchone()
            if self.output['data'] is not None:
                self.output['apiCode'] = 'SUCCESS'
            else:
                self.output['apiCode'] = 'ID_NOT_FOUND'
                self.output['message'] = f'Could not find an entry ID {id}'

    def get_pp_entry_by_eid(self):
        """
        Returns the people portal entries for a given employee ID
        and date range
        """
        args = request.args
        eid = args.get('eid')
        try:
            eid = int(eid)
        except:
            self.output['apiCode'] = "MISSING_OR_INVALID_EID"
            self.output['message'] = "Please supply a valid employee ID"
            return
        startdate = args.get('startdate')
        if not startdate:
            startdate = DT.datetime.now().strftime('%Y-%m-%d')
        enddate = args.get('enddate')
        if not enddate:
            enddate = startdate

        # Get employee information for this employee ID
        query = f'SELECT * FROM employee WHERE EId=%s'
        colVal = (eid)
        result = self.do_query(query, colVal)
        if result == 1:
            emp = self.cursor.fetchone()
            name = f"{emp['LastName']}, {emp['FirstName']}"
        else:
            self.output['apiCode'] = "UNKNOWN_EID"
            self.output['message'] = "EId did not return a unique employee"
            return

        # Get the people portal entries
        query = f'SELECT * FROM peoplePortal WHERE Name=%s and DelFlag=0 \
                  AND Date>=%s AND Date<=%s'
        colVal = (name, startdate, enddate)
        result = self.do_query(query, colVal)
        self.output['data'] = []
        if result != -1:
            self.output['data'] = self.cursor.fetchall()
            self.output['apiCode'] = 'SUCCESS'

        # Nothing found
        if self.output['apiCode'] == None:
            self.output['apiCode'] = "NO_ENTRIES_FOUND_IN_RANGE"
            self.output['message'] = "No entries found in that date range"

    def get_pp_entry_by_date_range(self):
        """
        Returns people portal entries for a given date range
        """
        args = request.args
        startdate = args.get('startdate')
        enddate = args.get('enddate')
        if not enddate:
            enddate = startdate

        # Grab ALL entries from the database
        query = f'SELECT * FROM peoplePortal WHERE DelFlag=0 \
                  AND Date>=%s AND Date<=%s'
        colVal = (startdate, enddate)
        if args.get('Department'):
            query = f'{query} and Department=%s'
            colVal = colVal + (args.get('Department'),)
        result = self.do_query(query, colVal)
        self.output['data'] = []
        if result != -1:
            self.output['data'] = self.cursor.fetchall()
            if not args.get('Department') or \
               'Observing Support' in args.get('Department'):
                oaNa = self.get_oa_na_schedule(startdate, enddate, args)
                new = tuple(self.output['data']) + tuple(oaNa)
                self.output['data'] = new
            self.output['apiCode'] = 'SUCCESS'

        # Include HQ/Remote synthetic events
        hq = self.add_hq_synthetic_entries(startdate, enddate, args)

        # Remove HQ/Remote entries already in the output
        newHQ = []
        for key,entry in enumerate(hq):
           test = [i for i in self.output['data'] 
                   if i['Date'] == entry['Date'].date() and 
                   i['Name'] == entry['Name']]
           if len(test) == 0:
               newHQ.append(entry)

        # Add HQ/Remote synthetic events
        new = tuple(self.output['data']) + tuple(newHQ)
        self.output['data'] = new

        # Remove entries based on filters
        for col in self.allowed_search:
            val = args.get(col[0])
            # Only if this field is used as a filter
            if val:
                newData = []
                for entry in self.output['data']:
                    # Default to skip this entry and check filters to include
                    skip = 1
                    if col[0] == 'leave':
                        for lv in self.leave_search:
                            if len(json.loads(entry[lv])) != 0:
                                skip = 0
                    else:
                        if entry[col[0]] and \
                           len(json.loads(entry[col[0]])) != 0:
                            skip = 0
                    # Include these in output
                    if skip == 0:
                        newData.append(entry)
                self.output['data'] = newData

        # Nothing found
        if self.output['apiCode'] == None:
            self.output['apiCode'] = "NO_ENTRIES_FOUND_IN_RANGE"
            self.output['message'] = "No entries found in that date range"

    def add_hq_synthetic_entries(self, startdate, enddate, args):
        """
        Loop through date range and create HQ/Remote employee sythetic events.
        """

        # Create a dict with only the location filter entry
        dArgs = dict(args)
        department = args.get('Department', '')
        for k in ['startdate','enddate','Department']:
            if k in dArgs.keys():
                tmp = dArgs.pop(k)

        hq = []
        # Get all HQ/Remote employees
        query = 'SELECT * FROM employee where (PrimaryLocation=%s or PrimaryLocation=%s)'# and PrimaryShift is not null'
        colVals = ['HQ','Remote']
        if department != '':
            query = f'{query} and Department=%s'
            colVals.append(department)
        employee = self.do_query(query, tuple(colVals))
        if employee != -1:
            entries = self.cursor.fetchall()
            start = DT.datetime.strptime(startdate, '%Y-%m-%d')
            end   = DT.datetime.strptime(enddate,   '%Y-%m-%d')
            holidays = ast.literal_eval(get_holidays())
            # Loop through date range and add HQ employees
            while start <= end:
                today = start.strftime('%Y-%m-%d')
                # Only create events for work days and skip holidays
                dow = int(start.strftime('%w'))


#                if dow > 0 and dow < 6 and today not in holidays:
                for emp in entries:
                    try:
                        if len(emp['PrimaryDays']) > 0:
                            shiftDays = emp['PrimaryDays']
                    except:
                        shiftDays = ['1','2','3','4','5']

                    holidayDates = [h['date'] for h in holidays]
                    if str(dow) in shiftDays and today not in holidayDates:
                        # Skip if not in location search
                        if len(dArgs) > 0 and emp['PrimaryLocation'] not in dArgs.keys():
                            continue
                        name = f"{emp['LastName']}, {emp['FirstName']}"
                        # Create the synthetic event
                        synthetic = {}
                        synthetic['Date'] = start
                        synthetic['Name'] = name
                        synthetic['Department'] = emp['Department']
                        try:
                            shift = json.loads(emp['PrimaryShift'])
                            for key,entry in enumerate(shift):
                                if ":" in entry:
                                    split = entry.split(':')
                                    value = split[0].rjust(2, '0')
                                    value = f"{value}:30" if split[1] == '30' else f"{value}:00"
                                else:
                                    value = f"{entry.rjust(2, '0')}:00"
                                if key == 0: sHour = value
                                else:        eHour = value
                        except:
                            sHour = '08:00'
                            eHour = '17:00'
                        startTime = f"{today} {sHour}:00"
                        endTime   = f"{today} {eHour}:00"
                        synthetic[emp['PrimaryLocation']] = f'["{startTime}", "{endTime}"]'
                        # Add to complete list
                        hq.append(synthetic)
                start += DT.timedelta(days=1)

        return hq

    def get_oa_na_schedule(self, startdate, enddate, args):
        """
        Returns the scheduled OA/NAs from keckOperations.nightStaff
        """
        # Create a dict with only the location filter entry
        dArgs = dict(args)
        for k in ['startdate','enddate','Department']:
            if k in dArgs.keys():
                tmp = dArgs.pop(k)
        # Get all night staff and save to oaNa
        oaNa = []
        query = 'SELECT * FROM nightStaff WHERE Date>=%s and Date<=%s and \
                 (Type like %s or Type like %s or Type like %s) and DelFlag=0;'
        args = (startdate, enddate, 'sa%', 'oa%', 'na%',)
        result = self.do_query(query, args)
        if result != -1:
            entries = self.cursor.fetchall()
            for entry in entries:
                # Skip if this is a bad type
                if entry['Type'] not in self.oaNaShifts.keys():
                    continue
                # Skip if filtered by location and entry not at that location
                if len(dArgs) != 0 and self.oaNaShifts[entry['Type']][2] not in dArgs.keys():
                    continue
                # Get this entry from employees and construct return dictionary
                query = 'SELECT * FROM employee where Alias=%s'
                employee = self.do_query(query, (entry['Alias'],))
                if employee != -1:
                    emp = self.cursor.fetchone()
                    sun = self.get_metrics(entry['Date'])
                    if sun == None:
                        continue
                    nightStaff = {}
                    nightStaff['Date'] = entry['Date']
                    name = f"{emp['LastName']}, {emp['FirstName']}"
                    nightStaff['Name'] = name
                    nightStaff['Department'] = emp['Department']
                    nightStaff['BaseCamp'] = emp['BaseCamp']
                    start = f"{entry['Date']} {self.oaNaShifts[entry['Type']][0]}"
                    start = start.replace('sunset', f"{sun['sunset']}:00:00")
                    end   = f"{entry['Date']} {self.oaNaShifts[entry['Type']][1]}"
                    end   = end.replace('sunrise', f"{sun['sunrise']}:00:00")
                    if self.oaNaShifts[entry['Type']][3] == True:
                        tomorrow = entry['Date'] + DT.timedelta(days=1)
                        tomorrow = tomorrow.strftime('%Y-%m-%d')
                        end = f"{tomorrow} {self.oaNaShifts[entry['Type']][1]}"
                        end = end.replace('sunrise', f"{sun['sunrise']}:00:00")

                    nightStaff[self.oaNaShifts[entry['Type']][2]] = f'["{start}", "{end}"]'
                    nightStaff['Comment'] = entry['Type']
                    oaNa.append(nightStaff)
        return oaNa

    def insert_pp_entry(self):
        """
        Insert a new people portal entry into the DB
        """
        id = self.entry_exists()
        if id != 0:
            self.output['apiCode'] = 'ENTRY_ALREADY_EXISTS'
            self.output['message'] = f'id = {id}'
            return

#        args = request.args
        data = request.form.to_dict()
        COLUMNS = [entry[0] for entry in self.pp_columns]
        TYPES = [entry[1] for entry in self.pp_columns]
        VALUES = [entry[2] for entry in self.pp_columns]
        notnull = []
        colVals = []
        
        # Build list of columns to insert and their values
        insert_columns = []
        for i in range(len(COLUMNS)):
            value = data.get(COLUMNS[i], VALUES[i])
            value = value if value != '' else VALUES[i]
            if value == 'not null':
                notnull.append(COLUMNS[i])
            else:
                insert_columns.append(COLUMNS[i])
                colVals.append(value)
                
        if len(notnull) > 0:
            self.output['apiCode'] = 'NOT_NULL_DEFAULT_VALUE_FOUND'
            self.output['message'] = f'{", ".join(notnull)} cannot be null'
            return
        
        # Build parameterized query
        col_names = ", ".join(insert_columns)
        placeholders = ", ".join(["%s"] * len(insert_columns))
        query = f'INSERT INTO peoplePortal ({col_names}) VALUES ({placeholders})'
        
        result = self.do_query(query, tuple(colVals))
        if result != -1:
            self.conn.commit()
            self.output['apiCode'] = 'SUCCESS'
            self.output['id']      = self.cursor.lastrowid
    
   
    def entry_exists(self):
        """
        Returns number of entries for Date/Name
        """

        data = request.form.to_dict()
        query = 'SELECT * from peoplePortal where Date=%s and Name=%s and DelFlag=0'
        colVals = (data.get('Date'), data.get('Name'))
        num = self.do_query(query, colVals)
        if num > 0:
            result = self.cursor.fetchone()
            return result['id']

        return num


    def update_pp_entry_by_id(self):
        """
        Updates a people portal entry using a given id
        """
        # retrieve data from the request 
        args = request.args
        data = request.form.to_dict()

        # remove the ID from the data
#        id = data.pop('id')
        id = args.get("id", 0)

        # extract the column headers value types for the table 
        # stored in the member variable pp_columns
        COLUMNS = [entry[0] for entry in self.pp_columns]
        TYPES = [entry[1] for entry in self.pp_columns]
        
        # Build parameterized UPDATE clause
        set_clauses = []
        colVals = []

        # parse the data sent from the frontend to update
        # the record with
        for key in data:
            try:
                key_index = COLUMNS.index(key)
            except:
                continue

            # Add to update clause with parameterized placeholder
            set_clauses.append(f'{key}=%s')
            colVals.append(data[key])

        if not set_clauses:
            self.output['apiCode'] = 'NO_DATA_TO_UPDATE'
            self.output['message'] = "No valid fields provided for update"
            return

        # format the values to be updated in the query
        set_clause = ', '.join(set_clauses)
        colVals.append(id)

        # backup the current record to peoplePortalHistory
        backup = f'INSERT INTO peoplePortalHistory \
                   SELECT v.* FROM peoplePortal AS v WHERE id=%s;'
        backup_res = self.do_query(backup, (id,))
        if backup_res == -1:
            self.output['apiCode'] = "ERROR_BACKING_UP_TO_HISTORY"
            self.output['message'] = "Error backing up the previous record"
            return

        # modify the selected record with the given data
        query = f'UPDATE peoplePortal SET {set_clause} WHERE id=%s'
        result = self.do_query(query, tuple(colVals))
        if result != -1:
            self.conn.commit()
            self.output['apiCode'] = 'SUCCESS'
        
 
    def delete_pp_entry_by_id(self):
        """
        Deletes a people portal entry by setting DelFlag=1;
        """
        args = request.args
        id = args.get("id", 0)
        try:
            id = int(id)
        except:
            self.output['apiCode'] = 'ERROR'
            self.output['message'] = 'Invalid ID'
            return
        query = f'UPDATE peoplePortal SET DelFlag=1 WHERE id=%s;'
        result = self.do_query(query, (id,))
        if result != -1:
            self.conn.commit()
            self.output['apiCode'] = 'SUCCESS'
        

    def get_all_employees(self):
        """
        Returns list of all active employees
        """
        self.output = []
#        self.output['apiCode'] = 'ERROR'
#        self.output['data'] = []
        query = 'SELECT * from employee where DelFlag=0 order by LastName;'
        result = self.do_query(query)
        if result != -1:
#            self.output['apiCode'] = 'SUCCESS'
            entries = self.cursor.fetchall()
            for entry in entries:
#                self.output['data'].append(entry)
                self.output.append(entry)


def do_api_call(apiType, call):
    """
    Entry point from the route to the pp_api() class
    """
    ppApiClass = PpApi(apiType, call)
    output = ppApiClass.output
    del ppApiClass
    return output


@app.route('/index/')
@app.route('/home/')
@app.route('/pp')
@app.route('/')
def home():
    resp = {"apiCode": "ERROR",
            "message": "Invalid input"}
    return resp
 
@app.route('/pp/entryById/', methods=['GET','POST','PUT','DELETE'])
@app.route('/pp/entryById', methods=['GET','POST','PUT','DELETE'])
def pp_entry_by_id():
    resp = {}
    if request.method == 'GET':
        resp = do_api_call('ppobs', 'getEntryById')
    elif request.method == 'POST':
        resp =  do_api_call('ppadmin', 'addEntry')
    elif request.method == 'PUT':
        resp = do_api_call('ppadmin', 'putEntryById')
    elif request.method == 'DELETE':
        resp = do_api_call('ppadmin', 'delEntryById')
    else:
        resp = {"apiCode": "UNAUTHORIZED METHOD",
                "message": "Please use GET/PUT/POST/DELETE"}
    return json.dumps(resp, default=jsonConverter)

@app.route('/pp/entryByDateRange/', methods=['GET'])
@app.route('/pp/entryByDateRange', methods=['GET'])
def pp_entry_by_date_range():
    """
    Returns all people portal entries within a date range
    """
    resp = {}
    if request.method=='GET':
        resp = do_api_call('ppobs', 'getEntryByRange')
    else:
        resp = {'apiCode': "UNAUTHORIZED_METHOD",
                'message': "Please use GET method instead"}
    return json.dumps(resp, default=jsonConverter)

@app.route('/pp/entryByEId/', methods=['GET'])
@app.route('/pp/entryByEId', methods=['GET'])
def pp_entry_by_eid():
    """
    Returns all people portal entries for a given employee ID and
    within a date range
    """
    resp = {}
    if request.method=='GET':
        resp = do_api_call('ppobs', 'getEntryByEId')
    else:
        resp = {'apiCode': "UNAUTHORIZED_METHOD",
                'message': "Please use GET method instead"}
    return json.dumps(resp, default=jsonConverter)

@app.route('/pp/entryByOverlap/', methods=['GET'])
@app.route('/pp/entryByOverlap', methods=['GET'])
def pp_entry_by_overlap():
    """
    Returns any people portal entries that overlap the current date and room
    """
    resp = {}
    if request.method=='GET':
        resp = do_api_call('ppadmin', 'getResvByOverlap')
    else:
        resp = {'apiCode': "UNAUTHORIZED_METHOD",
                'message': "Please use GET method instead"}
    return json.dumps(resp, default=jsonConverter)

@app.route('/pp/getEmployees/', methods=['GET'])
@app.route('/pp/getEmployees', methods=['GET'])
def get_employees():
    """
    Return JSON of all active employees.
    """
    resp = {}
    resp = do_api_call('ppobs', 'getEmployees')
    return json.dumps(resp, default=jsonConverter)

@app.route('/pp/holidays/', methods=['GET'])
@app.route('/pp/holidays', methods=['GET'])
def get_holidays():
    """
    Returns any scheduled holidays for the time period
    """
    args = request.args
    startdate = args.get('startdate')
    enddate = args.get('enddate')

    dbhost = config['db']['hosts'].split(',')[0]
    dbuser = config['common']['user']
    dbpwd = config['common']['password']
    db = config['common']['name']
    
    hConn = pymysql.connect(host=dbhost, user=dbuser, password=dbpwd, database=db, cursorclass=pymysql.cursors.DictCursor)
    hCursor = hConn.cursor()

    query = 'SELECT * FROM holidays WHERE date>=%s and date<=%s'
    result = hCursor.execute(query, (startdate, enddate))
    entries = hCursor.fetchall()

    if hConn:
        hCursor.close()
        hConn.close()

    holidays = []
    for entry in entries:
        holiday = {'date': entry['date'].strftime('%Y-%m-%d'), 'name': entry['holiday']}
        holidays.append(holiday)

    return json.dumps(holidays)

@app.route('/pp/isAdmin/', methods=['GET'])
@app.route('/pp/isAdmin', methods=['GET'])
def get_admin():
    """
    Returns JSON with entry on whether or not this user has admin access
    """
    args = request.args
    alias = args.get('alias')
    resp = {'apiCode': 'ALIAS_UNDEFINED', 'alias':alias, 'isAdmin':0}
    if alias:
        try:
            admin_list = config.get('DEFAULT', 'ADMIN', fallback='[]')
            # Parse the ADMIN string if it's in list format
            if isinstance(admin_list, str):
                admin_list = ast.literal_eval(admin_list)
            if alias in admin_list:
                resp['isAdmin'] = 1
            resp['apiCode'] = 'SUCCESS'
        except Exception as e:
            resp['apiCode'] = 'CONFIG_ERROR'
            resp['message'] = str(e)
    return json.dumps(resp)

def parse_args():
    """
    Parse the command line arguments.
    :return: <obj> commandline arguments
    """
    parser = argparse.ArgumentParser(description="Start People Portal API")
    parser.add_argument("--port", type=int, default=0, help="Server Port.")
    parser.add_argument("--mode", type=str, choices=['dev', 'release'],
                        default='release',
                        help="Determines database access and debugging mode.")

    return parser.parse_args()

def jsonConverter(o):
    if isinstance(o, DT.datetime) or isinstance(o, DT.date):
        return o.__str__()

if __name__ == '__main__':
    args = parse_args()
    port = args.port
    mode = args.mode
    debug = False if mode == 'release' else True
    host = '0.0.0.0'
    assert port != 0, "ERROR: Must provide port"
    app.run(host=host, port=port, debug=debug)
