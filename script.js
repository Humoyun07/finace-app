"use strict";


const app = document.querySelector(".app")
const welcomeMessage = document.querySelector(".welcome")
const movements = document.querySelector(".movements")
const balanceAmount = document.querySelector(".amount")
const labelDate = document.querySelector(".date")

const loginInput = document.querySelector(".user-input")
const loginPin = document.querySelector(".pin-input")
const loginBtn = document.querySelector(".login_btn")

const movDate = document.querySelector(".mov_date")
const movAmount = document.querySelector(".mov")
const movType = document.querySelector(".mov_type")

const transferUserInput = document.querySelector(".transfer_user")
const transferAmount = document.querySelector(".transfer_amount")
const transferBtn = document.querySelector(".transfer_btn")

const loanBtn = document.querySelector(".loan_btn")
const loanInput = document.querySelector(".loan_amount")

const summaryIn = document.querySelector(".in_amount")
const summaryOut = document.querySelector(".out_amount")

const timerLabel = document.querySelector(".timer")


const account1 = {
    user: "John Doe",
    username: 'john',
    password: 1111,
    movements: [200, -150, 100, -60, 50, 1000, -300, 270],
    movementDates: [
        '2023-11-01T13:15:33.035Z',
        '2022-11-30T09:48:16.867Z',
        '2022-12-25T06:04:23.907Z',
        '2023-01-25T14:18:46.235Z',
        '2023-02-05T16:33:06.386Z',
        '2023-10-07T17:01:17.194Z',
        '2023-10-08T23:36:17.929Z',
        '2023-10-09T10:51:36.790Z',
    ],
    currency: '$',
    locale: 'en-US'
}

const account2 = {
    user: "Kate Smith",
    username: 'kate',
    password: 2222,
    movements: [5000, -100, 4500, 2300, -170, 3700, 9000, -5000],
    movementDates: [
        '2022-11-18T21:31:17.178Z',
        '2022-12-23T07:42:02.383Z',
        '2023-01-28T09:15:04.904Z',
        '2023-04-01T10:17:24.185Z',
        '2023-10-02T14:11:59.604Z',
        '2023-10-07T17:01:17.194Z',
        '2023-10-08T23:36:17.929Z',
        '2023-10-09T10:51:36.790Z',
    ],
    currency: '$',
    locale: "en-US"
}
const accounts = [account1, account2]
let currentAcc, timer;

// configure dates
const formatDates = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date)

    const now = new Date();
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'short'
    };

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now)

    if (daysPassed === 0) return 'today'
    if (daysPassed === 1) return "yesterday"
    if (daysPassed <= 7) return `${daysPassed} days ago`
    else {
        return new Intl.DateTimeFormat(locale).format(date)
    }
}

// Display Balance
const displayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0)
    balanceAmount.textContent = `${acc.currency}${acc.balance.toFixed(2)}`
}

// Display movements
const diplayMovements = function (acc) {
    movements.innerHTML = "";

    acc.movements.forEach((mov, i) => {
        const date = new Date(acc.movementDates[i])
        const html = `
        <div class="movement_row">
            <p class="mov_type ${mov > 0 ? 'deposit' : 'withdrawal'}">${mov > 0 ? 'deposit' : 'withdrawal'}</p>
            <p class="mov_date">${formatDates(date, acc.locale)}</p>
            <p class="mov mov_${mov > 0 ? 'deposit' : 'withdrawal'}">${acc.currency}${Math.abs(mov)}</p>
        </div>`
        movements.insertAdjacentHTML('afterbegin', html)
    })
}

const displaySummary = function (acc) {
    // income
    const income = acc.movements.filter(mov => mov > 0).reduce((acc, cur) => acc + cur, 0)
    summaryIn.textContent = `${acc.currency}${income.toFixed(2)}`

    // outcome
    const outcome = acc.movements.filter(mov => mov < 0).reduce((acc, cur) => acc + cur, 0)
    summaryOut.textContent = `${acc.currency}${Math.abs(outcome).toFixed(2)}`
}


const updateUI = function (acc) {
    diplayMovements(acc)
    displayBalance(acc)
    displaySummary(acc)
}

const findCurAcc = function (accs) {
    currentAcc = accs.find(acc =>
        acc.username === loginInput.value && acc.password === Number(loginPin.value)
    )
    return currentAcc;

}

const logOutTimer = function () {
    let time = 300
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, 0)
        const sec = String(time % 60).padStart(2, 0)
        timerLabel.textContent = `${min}:${sec}`
        console.log(`${min}:${sec}`);
        if (time === 0) {
            clearInterval(tick)
            app.style.opacity = 0
            welcomeMessage = "Welcome, log in to start"
        }
        time -= 1;
    }
    tick()
    timer = setInterval(tick, 1000)
    return timer;
}


////// BUTTON event handlers ////
// logging in with login button
loginBtn.addEventListener("click", function (e) {
    e.preventDefault()
    currentAcc = findCurAcc(accounts)
    if (currentAcc) {
        app.style.opacity = 100
        welcomeMessage.textContent = `Welcome, ${currentAcc.user}`
        welcomeMessage.style.fontWeight = 600
        loginInput.value = loginPin.value = ""
        loginPin.blur()
    }
    // start timer
    if (timer) clearInterval(timer)
    logOutTimer()
    updateUI(currentAcc)
})


// transfering money with send button
transferBtn.addEventListener('click', function (e) {
    e.preventDefault()
    const balance = +(balanceAmount.textContent.split('$')[1]);
    const amount = +transferAmount.value
    const now = new Date().toISOString()
    const receiver = accounts.find(acc => acc.username === transferUserInput.value)
    if (receiver && balance >= amount && amount > 0) {
        receiver.movements.push(amount)
        currentAcc.movements.push(-amount)
        receiver.movementDates.push(now)
        currentAcc.movementDates.push(now)
        transferUserInput.value = transferAmount.value = ""
        transferAmount.blur()
    }
    // restart timer
    clearInterval(timer)
    logOutTimer()
    updateUI(currentAcc)
})

// LOAN Button - requesting loans
loanBtn.addEventListener("click", function (e) {
    e.preventDefault()
    const amount = +loanInput.value
    const now = new Date().toISOString()
    if (amount <= 5000 && amount > 0) {
        setTimeout(function () {
            currentAcc.movements.push(amount)
            currentAcc.movementDates.push(now)
            loanInput.value = ""
            loanInput.blur()
            updateUI(currentAcc)
        }, 2500)
    }
    // restart timer
    clearInterval(timer)
    logOutTimer()
})

