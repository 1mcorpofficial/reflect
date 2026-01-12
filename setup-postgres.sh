#!/bin/bash

# Skriptas Postgres authentication nustatymui

echo "=== Postgres Authentication Setup ==="
echo ""
echo "Pasirinkite variantą:"
echo "1. Nustatyti slaptažodį 'postgres' (rekomenduojama)"
echo "2. Pakeisti į 'trust' authentication (be slaptažodžio)"
echo ""
read -p "Pasirinkite (1 arba 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "Nustatome slaptažodį 'postgres'..."
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
    echo ""
    echo "✓ Slaptažodis nustatytas!"
    echo ""
    echo "Jūsų .env failas turėtų būti:"
    echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/reflectus\""
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Pakeičiame authentication į 'trust'..."
    
    # Backup
    sudo cp /etc/postgresql/14/main/pg_hba.conf /etc/postgresql/14/main/pg_hba.conf.backup
    
    # Pakeisti host connections
    sudo sed -i 's/host.*all.*all.*127\.0\.0\.1\/32.*scram-sha-256/host    all             all             127.0.0.1\/32            trust/' /etc/postgresql/14/main/pg_hba.conf
    sudo sed -i 's/host.*all.*all.*127\.0\.0\.1\/32.*md5/host    all             all             127.0.0.1\/32            trust/' /etc/postgresql/14/main/pg_hba.conf
    
    # Pakeisti local connections
    sudo sed -i 's/local.*all.*all.*peer/local   all             all                                     trust/' /etc/postgresql/14/main/pg_hba.conf
    
    # Perkraukti Postgres
    sudo systemctl restart postgresql
    
    echo ""
    echo "✓ Authentication pakeista į 'trust'"
    echo ""
    echo "Jūsų .env failas turėtų būti:"
    echo "DATABASE_URL=\"postgresql://postgres@localhost:5432/reflectus\""
    
else
    echo "Netinkamas pasirinkimas!"
    exit 1
fi

echo ""
echo "Dabar galite migruoti DB:"
echo "npm run db:migrate"

