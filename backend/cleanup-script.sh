#!/bin/bash
mysql -u root -p'root' realestate_db -e "CALL cleanup_expired_data();"