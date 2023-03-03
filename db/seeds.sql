    INSERT INTO department (id, name)
    VALUES (01, "Sales"),
           (02, "Customer Service"),
           (03, "Marketing"),
           (04, "Finance"),
           (05, "Legal");

    INSERT INTO role (id, title, salary, department_id)
    VALUES (10, "Sales Associate", 40000.00, 01),
           (11, "Area Sales Representative", 65000.00, 01),
           (12, "Customer Support", 47500.00, 02),
           (13, "Store Secretary", 66000.00, 02);

    INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
    VALUES (01, "Dino", "Arslanovic", 10, 01),
           (02, "Pedro", "Pascal", 11, NULL);