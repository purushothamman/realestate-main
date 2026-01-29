#!/bin/bash
mysql -u root -p'hibro' realestate -e "CALL cleanup_expired_data();"