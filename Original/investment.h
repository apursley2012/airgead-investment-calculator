/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: Declares the investment result model and Investment interface     |
  |          shared by the original C++ application and its regression tests.  |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

#ifndef INVESTMENT_H
#define INVESTMENT_H

#include <vector>

// Year-end earned interest covers only this year, not total lifetime interest.
struct YearlyInvestmentResult {
	int year;
	double yearEndBalance;
	double yearEndEarnedInterest;
};

// Stores investment inputs and produces the two projections required by
// the original Airgead Banking console application.
class Investment {
public:
	// Bound console output and memory use for unusually large year inputs.
	static constexpr int MaxYears = 1000;

	Investment(
		double initialInvestment,
		double monthlyContribution,
		double annualInterestRate,
		int numberOfYears);

	void setInitialAmount(double amount);
	void setMonthlyDeposit(double amount);
	void setAnnualInterest(double annualRate);
	void setYears(int numberOfYears);

	double getInitialAmount() const;
	double getMonthlyDeposit() const;
	double getAnnualInterest() const;
	int getYears() const;

	std::vector<YearlyInvestmentResult>
	calculateWithoutMonthlyDeposit() const;
	std::vector<YearlyInvestmentResult>
	calculateWithMonthlyDeposit() const;

	void displayWithoutMonthlyDeposit() const;
	void displayWithMonthlyDeposit() const;

private:
	double initialAmount;
	double monthlyDeposit;
	double annualInterest;
	int years;
};

#endif
