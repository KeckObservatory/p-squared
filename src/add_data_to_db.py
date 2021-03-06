import requests
import pdb
import json
from datetime import datetime

if __name__=="__main__":
    #get files
    filename = './entries.json'
    with open(filename, 'r') as f:
        entries = json.load(f)

    #add them to db one by one
    url='https://vm-appserver.keck.hawaii.edu/api/pp/'
    url+='entryById'
    for entry in entries:
        creationTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        data = {}
        for key in  entry['data'].keys():
            if not entry['data'][key]==None: 
                data[key] = entry['data'][key]
        data['CreationTime'] = creationTime 
        data['Staff'] = 'ttucker'
        response=requests.post(url, data=data, verify=False)
        print(response.json())


