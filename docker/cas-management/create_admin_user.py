#!/usr/bin/env python
import mysql.connector

with mysql.connector.connect(user='root', password='my-super-secret-password',
                             host='127.0.0.1',
                             database='cas') as connection:
    with connection.cursor() as cursor:
        for script_file in ["/home/stefan/Projects/Inbo/alf-local-demo/containerized/db-init/40-cas-role-editor.sql",
                            "/home/stefan/Projects/Inbo/alf-local-demo/containerized/db-init/50-cas-admin-add.sql"]:
            with open(script_file, "r") as script:
                sql_script = script.read()
                for result in cursor.execute(sql_script, multi=True):
                    print(f"Ran {script_file}: {result.rowcount}")
