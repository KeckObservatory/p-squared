.. DDOILoggerClient documentation master file, created by
   sphinx-quickstart on Thu Oct 13 15:10:11 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to People Planner's Documentation!
==========================================

Overview:
---------
The `People Planner <https://www3.keck.hawaii.edu/staff/p-squared/rel/index.html>`_ (AKA P-Squared, P^2, or PP) is a web tool that notifies Keck staff where
every employee is during their working shift and what their status is.
It answers the question "Where is (insert name here)?".
If an employee is unavailable then P^2 shows a designated status explaining their absense that
includes but is not limited to: Leave, Travel, and Jury Duty. 
P-Squared allows users to enter in their status in hour blocks, and up to two locations per day. 
For example, for an Wamiea-based employee working a half day in the morning, 
they would have an entry showing their location as "HQ" from 8am-12pm and then "Leave" from 12pm to 5pm.

The People planner comprises of a user interface (UI or Frontend) run by a web browser, either Firefox, Chrome, Safari, or Edge. 
The UI leverages an API (or Backend) which connects to a database, where user entries are created, edited, and deleted. 

All Keck Staff has access to P-Squared. They log in through the authentication portal, using their
LDAP (Windows) account name and password. All staff can create, edit and delete entries for themselves or other employees.

Use Cases:
----------
* An employee's manager inserts a sick day for their employee.
* An employee adds an entry showing that they will be working remotely on the first half of the day.
* An employee edits their existing entry's location from Summit to HP due to weather.

Interconnected Systems:
-----------------------
The Staffinfo API adds user specific information for the person running the application. This is how the UI knows who is 'signed in' to 
an instance of the UI.

TelSchedule API adds information for every employee, including but not limited to: name, alias, and phone number. 
For example, when editing an employee entry as 'WFH' their cell phone number is automatically added to the comment field.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   build

   troubleshooting 

Software Source Control 
-----------------------
* Github source for the ui is located at `https://github.com/KeckObservatory/p-squared <https://github.com/KeckObservatory/p-squared>`_
* SVN location for the backend API: **Place where API lives**
* Database is located at: **Place where database lives**

Security
--------

P-Squared is accessable through staff, but has no authorization control. 
Any user can change any user's status.
This includes editing and deleting existing entries. Be careful!

Indices and tables
------------------

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

   