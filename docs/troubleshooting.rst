Troubleshooting & FAQ
=====================

A. **Staffinfo is not correct**

   Check that the Staffinfo API is running by making the following request in your browser.

   `https://www3.keck.hawaii.edu/staffinfo/ <https://www3.keck.hawaii.edu/staffinfo/>`_

B. **Employee info is not showing**

   Check that telSchedule API is running by making the following request in your browser.
   
   `https://www3.keck.hawaii.edu/api/telSchedule?cmd=getEmployee <https://www3.keck.hawaii.edu/api/telSchedule?cmd=getEmployee>`_

C. **Entry was not created after exiting**

   Check that the entry does not already exist for the given date(s).
   Entries may not overlap in time with one another. If a validated entry is added to the database and there already exists an entry, 
   then the entry will not get added. 

D. **Entry was not created after clicking submit button**

   Entries are first passed through a validation procedure before submitting to database. The reason why is provided at the top of
   the entry form. See example below.

   .. figure:: _static/entry-form-fail.png
      :width: 300

      Example of an entry that has not passed the validator. 
      Note the error message in red on the top.

E. **Observation Assistant and/or night attendent entries are not showing**
   
   Check cron scripts. Try running them manually and see what the error is by debugging script.

F. **Staff Astronomer entries are not showing up**
 
   Check cron scripts. Try running them manually and see what the error is by debugging script.

G. **LOAR entries are not showing up**

   Check cron scripts. Try running them manually and see what the error is by debugging script.

   .. figure:: _static/run-loar-to-pp.png
      :width: 800

G. **While in monthly view the times are wrong**

   The Monthly view events are too thin to see, so they have been expanded to the whole day. 
   Consequentially, the hovor over feature reflects this artificial time. Switch to week or day
   view to see the correct start and end datetime.

Some text on the API ``inline text``. 

Training
========

A link to how to use the tool is provided at `https://vimeo.com/752784618/fe1f9eaebb <https://vimeo.com/752784618/fe1f9eaebb>`_