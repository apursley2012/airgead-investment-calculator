#include <iomanip>
#include <iostream>
#include <vector>
#include "Investment.h"

using namespace std;

Investment::Investment(double initAmt, double monthlyDep, double annualInt, int yrs) {
    initialAmount = initAmt;
    monthlyDeposit = monthlyDep;
    annualInterest = annualInt;
    years = yrs;
}

void Investment::setInitialAmount(double amt) {
    initialAmount = amt;
}

void Investment::setMonthlyDeposit(double amt) {
    monthlyDeposit = amt;
}

void Investment::setAnnualInterest(double rate) {
    annualInterest = rate;
}

void Investment::setYears(int yrs) {
    years = yrs;
}

double Investment::getInitialAmount() const {
    return initialAmount;
}

double Investment::getMonthlyDeposit() const {
    return monthlyDeposit;
}

double Investment::getAnnualInterest() const {
    return annualInterest;
}

int Investment::getYears() const {
    return years;
}

vector<YearlyInvestmentResult> Investment::calculateWithoutMonthlyDeposit() const {
    vector<YearlyInvestmentResult> results;
    double total = initialAmount;
    double monthlyRate = (annualInterest / 100.0) / 12.0;

    for (int year = 1; year <= years; ++year) {
        double yearlyInterest = 0.0;

        for (int month = 0; month < 12; ++month) {
            double monthlyInterest = total * monthlyRate;
            total += monthlyInterest;
            yearlyInterest += monthlyInterest;
        }

        results.push_back({ year, total, yearlyInterest });
    }

    return results;
}

vector<YearlyInvestmentResult> Investment::calculateWithMonthlyDeposit() const {
    vector<YearlyInvestmentResult> results;
    double total = initialAmount;
    double monthlyRate = (annualInterest / 100.0) / 12.0;

    for (int year = 1; year <= years; ++year) {
        double yearlyInterest = 0.0;

        for (int month = 0; month < 12; ++month) {
            total += monthlyDeposit;
            double monthlyInterest = total * monthlyRate;
            total += monthlyInterest;
            yearlyInterest += monthlyInterest;
        }

        results.push_back({ year, total, yearlyInterest });
    }

    return results;
}

static void printReport(const string& title, const vector<YearlyInvestmentResult>& rows) {
    cout << endl << title << endl;
    cout << string(66, '=') << endl;
    cout << left << setw(8) << "Year"
         << right << setw(24) << "Year End Balance"
         << setw(30) << "Year End Earned Interest" << endl;
    cout << string(66, '-') << endl;

    for (const YearlyInvestmentResult& row : rows) {
        cout << left << setw(8) << row.year
             << right << "$" << setw(23) << fixed << setprecision(2) << row.yearEndBalance
             << "$" << setw(29) << fixed << setprecision(2) << row.yearEndEarnedInterest
             << endl;
    }
}

void Investment::displayWithoutMonthlyDeposit() const {
    printReport("Balance and Interest Without Additional Monthly Deposits", calculateWithoutMonthlyDeposit());
}

void Investment::displayWithMonthlyDeposit() const {
    printReport("Balance and Interest With Additional Monthly Deposits", calculateWithMonthlyDeposit());
}
