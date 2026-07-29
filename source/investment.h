#ifndef INVESTMENT_H
#define INVESTMENT_H

#include <vector>

struct YearlyInvestmentResult {
    int year;
    double yearEndBalance;
    double yearEndEarnedInterest;
};

class Investment {
private:
    double initialAmount;
    double monthlyDeposit;
    double annualInterest;
    int years;

public:
    Investment(double initAmt, double monthlyDep, double annualInt, int yrs);

    void setInitialAmount(double amt);
    void setMonthlyDeposit(double amt);
    void setAnnualInterest(double rate);
    void setYears(int yrs);

    double getInitialAmount() const;
    double getMonthlyDeposit() const;
    double getAnnualInterest() const;
    int getYears() const;

    std::vector<YearlyInvestmentResult> calculateWithoutMonthlyDeposit() const;
    std::vector<YearlyInvestmentResult> calculateWithMonthlyDeposit() const;

    void displayWithoutMonthlyDeposit() const;
    void displayWithMonthlyDeposit() const;
};

#endif
