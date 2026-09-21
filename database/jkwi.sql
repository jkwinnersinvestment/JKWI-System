CREATE DATABASE jkwi_system;

USE jkwi_system;


-- USERS / INVESTORS TABLE

CREATE TABLE investors (

    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    id_number VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) NOT NULL UNIQUE,

    phone VARCHAR(30),

    country VARCHAR(50),

    investor_type VARCHAR(50),

    password VARCHAR(255) NOT NULL,

    email_verified BOOLEAN DEFAULT FALSE,

    phone_verified BOOLEAN DEFAULT FALSE,

    account_status VARCHAR(30) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- INVESTMENT PROJECTS

CREATE TABLE projects (

    id INT AUTO_INCREMENT PRIMARY KEY,

    project_name VARCHAR(150) NOT NULL,

    division VARCHAR(100),

    description TEXT,

    minimum_investment DECIMAL(12,2),

    status VARCHAR(50) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- INVESTMENTS

CREATE TABLE investments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    investor_id INT,

    project_id INT,

    amount DECIMAL(12,2),

    investment_status VARCHAR(50) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY (investor_id)
    REFERENCES investors(id),


    FOREIGN KEY (project_id)
    REFERENCES projects(id)

);



-- PAYMENTS

CREATE TABLE payments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    investor_id INT,

    investment_id INT,

    payment_reference VARCHAR(100),

    amount DECIMAL(12,2),

    payment_status VARCHAR(50),

    payment_method VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY (investor_id)
    REFERENCES investors(id),


    FOREIGN KEY (investment_id)
    REFERENCES investments(id)

);



-- DOCUMENTS

CREATE TABLE documents (

    id INT AUTO_INCREMENT PRIMARY KEY,

    investor_id INT,

    document_name VARCHAR(150),

    document_path VARCHAR(255),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY (investor_id)
    REFERENCES investors(id)

);



-- ADMIN USERS

CREATE TABLE admins (

    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100),

    password VARCHAR(255),

    role VARCHAR(50)

);



-- INSERT FIRST ADMIN ACCOUNT

INSERT INTO admins
(username,password,role)

VALUES

('admin','change_this_password','Super Admin');