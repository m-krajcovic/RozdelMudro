This app is for splitting expenses between friends.
The usual use case is that a group of friends go on a trip. They all have some expenses and want to split them between them.
Sometimes it's all of them, sometimes it's just a few of them. Sometimes it's split equally but sometimes some people pay more or less.

This app solves this problem simply.
There's a list of expenses. Each expense contains a name of the payer, one or more recipients and the amount of the expense.
To create a new expense, there's a form for entering the expense data.
There's a screen to view all expenses and a screen to view the total balance of everyone.

The expenses are stored in a Google Sheet which is used as a database. Every user has access to the same sheet.
The group creator owns the sheet on Google Drive and can give access to other users.

**Usage:**

1. Open the app in your browser without parameters to configure your Sheet:
   ```
   index.html
   ```
2. Enter your Google Sheet ID (or leave blank to auto-create a new sheet) and comma-separated list of users, then click **Start**.
3. The app will reload with the Sheet ID in the URL, for example:
   ```
   index.html?sheet=YOUR_GOOGLE_SHEET_ID
   ```

The app is a simple web app with no backend. It is written in HTML, CSS and JavaScript.

To calculate the split, we first calculate the total amount of the expenses. Then we calculate the amount each person should pay.
The amount each person should pay is the total amount divided by the number of recipients.
Then we subtract the amount each person should pay from the total amount.

This reduces the number of transactions, but it also means that you might need to pay someone who didn't pay for you.

## Project Structure

This is the suggested file and folder layout for the Expense Splitter application:

```
.
├── index.html
├── css
│   └── styles.css
├── js
│   ├── app.js
│   ├── config.js
│   ├── googleAuth.js
│   ├── sheetsService.js
│   ├── setup.js
│   ├── expenseForm.js
│   ├── expenseList.js
│   ├── balanceView.js
│   └── utils.js
├── README.md
└── instructions.md
```