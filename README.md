This app is for splitting expenses between friends.
The usual use case is that a group of friends go on a trip. They all have some expenses and want to split them between them.
Sometimes it's all of them, sometimes it's just a few of them. Sometimes it's split equally but sometimes some people pay more or less.

This app solves this problem simply.
There's a list of expenses. Each expense contains a name of the payer, one or more recipients and the amount of the expense.
To create a new expense, there's a form for entering the expense data.
There's a screen to view all expenses and a screen to view the total balance of everyone.

The expenses are stored in a Google Sheet which is used as a database. Every user has access to the same sheet.
The group creator owns the sheet on Google Drive and can give access to other users.

The app is a simple web app with no backend. It is written in HTML, CSS and JavaScript.

To calculate the split, we first calculate the total amount of the expenses. Then we calculate the amount each person should pay.
The amount each person should pay is the total amount divided by the number of recipients.
Then we subtract the amount each person should pay from the total amount.

This reduces the number of transactions, but it also means that you might need to pay someone who didn't pay for you.