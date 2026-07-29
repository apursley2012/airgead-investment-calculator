#include <iostream>
#include <limits>
#include "Investment.h"

using namespace std;

static double readNonNegativeDouble(const string& label) {
    double value;

    while (true) {
        cout << label;
        cin >> value;

        if (!cin.fail() && value >= 0.0) {
            return value;
        }

        cout << "Please enter a valid number that is 0 or greater." << endl;
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

static int readPositiveInteger(const string& label) {
    int value;

    while (true) {
        cout << label;
        cin >> value;

        if (!cin.fail() && value > 0) {
            return value;
        }

        cout << "Please enter a whole number greater than 0." << endl;
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

int main() {
    cout << "**************************************" << endl;
    cout << "********* Airgead Banking ************" << endl;
    cout << "**************************************" << endl;

    double initialAmount = readNonNegativeDouble("Initial Investment Amount: $");
    double monthlyDeposit = readNonNegativeDouble("Monthly Deposit: $");
    double annualInterest = readNonNegativeDouble("Annual Interest (%): ");
    int years = readPositiveInteger("Number of years: ");

    Investment investment(initialAmount, monthlyDeposit, annualInterest, years);

    investment.displayWithoutMonthlyDeposit();
    investment.displayWithMonthlyDeposit();

    return 0;
}
