import requests
import pdb
import json

if __name__=="__main__":
    #get files
    filename = './entries.json'
    with open(filename, 'r') as f:
        entries = json.load(f)

    #add them to db one by one
    url='https://vm-appserver.keck.hawaii.edu/api/pp/'
    url+='entryById'
    pdb.set_trace()
    for entry in entries[0:1]:
        response=requests.post(url, data=entry)
        print(response)


