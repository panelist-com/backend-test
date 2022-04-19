# Backend Test

## Task 1

Evaluate `example.websocket-connector.ts` and outline the following:

1) What do you understand is the purpose of this code?
2) Explain how would you convert this code to MySQL from DynamoDB?
3) How would you rewrite broadcastToMany function?
4) What would you suggest are improvements that can be made to this code?
## Task 2

Evaluate `example.service.ts` and outline the following:

1) Explain what you understand this code does in high level?
2) What problems do you see with this code style?
3) How would you refactor this functionality to improve its readability?

## Task 3

Using Next.js and Sequelize syntax write a function to satisfy the following requirements:

1) Given the following simplified models:

- User model (id, email, password, status, phone, firstName, lastName, companyId, industryId)
- Company model (id, companyName, description, url)
- Industry model (id, industryName, description)

2) Given the following input CSV file format:

- firstName,lastName,phone,companyName,industryName

3) Create an import function that will populate all models as required and if any
   information is missing (e.g. Company does not exist, Industry does not exist), that
   information is populated. Similarly if a user already exists, but their phone number
   has changed, update the phone number for example. If their company is updated, create
   the new company if required and then update the user model to match.

4) Assume that if the user does not exist; their password is to be set to an empty string
   and status is to be set to 'pending' (string)

We are looking at code style; not exact functionality, so please note any assumptions you may
make - e.g. what TypeScript definitions are required / set by the model already elsewhere, etc.