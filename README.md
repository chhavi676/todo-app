md = markdown
{{baseUrl}} = baseUrl/
              baseUrl

Bearer Token - the one who carries the token 

TERMS:
sub - subject
IAT - Issued At (date in unix seconds)
Exp - date of expiry
NBF - not before
ISS - Issuer of the token
AUD - audience for which the token is created (third part...)
JTI - JWT ID

Bcrypt - one way hashing/encryption algorithm

Order of Execution ::
1. Body Parser - express
2. Cors
3. Logger
4. public routes
5. protected routes
6. Error Handlers
7. Custom middleware - for response handling