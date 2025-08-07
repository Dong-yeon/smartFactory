IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'smartFactory')
BEGIN
    CREATE DATABASE smartFactory;
END;
