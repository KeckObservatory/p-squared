import numpy as np
import json
import random
import string
import itertools
import datetime
import pdb
import json

letters = string.ascii_lowercase
names = [
    "Michael Bluth",
    "Lindsay Bluth-Fünke",
    "Gob Bluth",
    "George Michael Bluth",
    "Maeby Fünke",
    "Buster Bluth",
    "Tobias Fünke",
    "George Bluth Sr.",
    "Lucille Bluth",
    "Narrator",
    "Oscar Bluth",
    "Lucille Austero",
    "Barry Zuckerkorn",
    "Kitty Sanchez",
    "Steve Holt",
    "Lupe",
    "Annyong Bluth",
    "Carl Weathers",
    "Maggie Lizer",
    "Stefan Gentles",
    "Marta Estrella",
    "Cindi Lightballoon",
    "John Beard",
    "Ann Veal",
    "Wayne Jarvis",
    "Dr. Fishman",
    "Stan Sitwell",
    "Sally Sitwell",
    "Mort Meyers",
    "Starla",
    "Tony Wonder",
    "Gene Parmesan",
    "Terry Veal",
    "Rita Leeds",
    "Larry Middleman",
    "Bob Loblaw",
    "Ron Howard",
    "DeBrie Bardeaux",
    "Rebel Alley",
    "Murphy Brown Fünke",
    "Lottie Dottie Da",
    "Dusty Radler"
]

timeConstraint = [
    None, [['2021-01-01 08:00:00', '2021-01-01 10:00:00'],
           ['2021-02-02 09:00:00', '2021-02-03 18:00:00'],
           ['2021-05-01 08:00:00', '2021-06-01 10:00:00'],
           ['2021-06-01 08:00:00', '2021-06-07 10:00:00']
           ]]

#basecamp = [
#    "HQ", "Summit", "HP", "Hilo", "Other"
#]

basecamp = [
    "HQ", "Summit" 
]

pickupLocation = [
    'HPP',
    'HQ',
    'Hilo',
    'SJP',
    'WJP'
]

summitLead = [
    '7-3',
    '7-9',
    '9-5',
    '3-5'
]

supportLead = [
    'K1',
    'K2',
    'K1 & K2'
]

additionalSeats = [ str(x) for x in range(1,7) ]

departments = [
    "Administration", "AO/Optics", "Development Program Support", "Directorate Office",
    "Engineering", "Finance", "Observing Support", "Operations and Infrastructure",
    "Scientific Software", "Software", "Systems Administration", "Council"
]

location = [
    "HQ",
    "SU",
    "HP",
    "Hilo",
    "Kona",
    "WFH",
    "Remote",
    "Sick",
    "Vacation",
    "JuryDuty",
    "FamilySick",
    "Flex",
    "Travel",
    "NgtSup"
]

comments = [
    "Here?s some money. Go see a star war.",
    "I don?t understand the question and I won?t respond to it.",
    "I am one of the few honest people I have ever known.",
    "I?m a scholar. I enjoy scholarly pursuits.",
    "I?ve made a huge tiny mistake.",
    "I hear the jury?s still out on science.",
]

semesters = [
    str(x)+y for x, y in itertools.product(range(2019, 2022), ['A', 'B'])]

numDays = 120
base = datetime.datetime.today()
date_list = [base + datetime.timedelta(days=x) for x in range(numDays)]
date_list_str = [datetime.datetime.strftime(x, '%Y-%m-%d') for x in date_list]


#def randName(): return random.choice(names)
def randName(): 
    with open('./employees.json') as f:
        employees = json.loads(f.read())
    employee = random.choice(employees)
    name = employee.get('LastName') + ', ' + employee.get('FirstName')
    return name 
def randDate(): return random.choice(date_list_str)
def randBase(): return random.choice(basecamp)
def randDept(): return random.choice(departments)
def randLoca(): return random.choice(location)
def randHour(): return random.choice(range(24))
def randShift(): return random.choice(range(4, 9))


def randComment(): return random.choice(comments)
def randOptComment(): return random.choice([None, randComment()])

def randPickupLocation(): return random.choice(pickupLocation)
def randOptPickupLocation(): return random.choice([None, randPickupLocation()])

def randSummitLead(): return random.choice(summitLead)
def randOptSummitLead(): return random.choice([None, randSummitLead()])

def randSupportLead(): return random.choice(supportLead)
def randOptSupportLead(): return random.choice([None, randSupportLead()])

def randAdditionalSeats(): return random.choice(additionalSeats)
def randOptAdditionalSeats(): return random.choice([None, randAdditionalSeats()])


def randDateRange():
    fmt = "%Y-%m-%d %H:%M:%S"
    baseDate = randDate()
    baseHour = randHour()
    shift = randShift()
    startDate = datetime.datetime.strptime(
        baseDate + f" {baseHour}:00:00", fmt)
    endDate = startDate + datetime.timedelta(hours=shift)
    dateRange = [startDate, endDate]
    dateRangeStr = [datetime.datetime.strftime(x, fmt) for x in dateRange]
    return dateRangeStr


def randString(x=4): return ''.join(random.choice(letters) for i in range(x))
def randFloat(mag=10): return mag * random.uniform(0, 1)
def randBool(): return bool(random.choice([0, 1, None]))
def randInt(lr=0, ur=100): return random.randint(lr, ur)
def randArrStr(x=1, y=1): return [randString(x)
                                  for _ in range(random.randint(1, y))]


def optionalRandString(x=4): return random.choice([None, randString(x)])
def optionalRandArrString(x, y=1): return random.choice(
    [None, randArrStr(x, y)])


def z_fill_number(x, zf=2): return str(x).zfill(2)


null = None


def make_schedule_entry(idx):
    # "HQ": "[\"2022-05-01 08:00:00\", \"2022-05-01 17:00:00\"]",
    key = randLoca()
    dateSlot = random.choice([null, randDateRange()])
    if dateSlot:
        date = null, dateSlot[0].split(' ')[0]
    else:
        date = randDate()
    data = {"id": idx,
            "Date": date,
            "Name": randName(),
            "Department": randDept(),
            "BaseCamp": randBase(),
            "HQ": null,
            "SU": null,
            "HP": null,
            "Hilo": null,
            "Kona": null,
            "WFH": null,
            "Vacation": null,
            "Sick": null,
            "FamilySick": null,
            "JuryDuty": null,
            "Travel": null,
            "Other": null,
            "Comment": randOptComment(),
            "Staff": "test",
            "DelFlag": 0,
            "AlternatePickup": randOptPickupLocation(),
            "SummitLead": randOptSummitLead(),
            "SupportLead": randOptSupportLead(),
            "CrewLead": null,
            "Seats": randOptAdditionalSeats(),
            "CreationTime": "2022-05-11 12:31:52",
            "LastModification": "2022-05-10 13:43:37",
            "Staff": "ttucker"
            }
    data[key] = json.dumps(dateSlot)
    entry = {
        "apiCode": "SUCCESS",
        "data": data
    }
    return entry


if __name__ == "__main__":

    seed = 1984739
    random.seed(seed)

    print("...generating entries")
    entries = [make_schedule_entry(x) for x in range(400)]
    with open('entries.json', 'w') as outfile:
        json.dump(entries, outfile, indent=4)
