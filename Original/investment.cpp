/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: Implements Airgead's original monthly compounding calculations    |
  |          and formatted year-by-year console reports.                       |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

#include "investment.h"

#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

void requireNonnegativeFinite(double value, const char* field) {
	if (!std::isfinite(value) || value < 0.0) {
		throw std::invalid_argument(std::string(field) + " must be finite and nonnegative.");
	}
}

void requireSafeYears(int value) {
	if (value < 1 || value > Investment::MaxYears) {
		throw std::invalid_argument("Years must be between 1 and 1000.");
	}
}

void requireFiniteProjection(double total, double yearlyInterest) {
	if (!std::isfinite(total) || !std::isfinite(yearlyInterest)) {
		throw std::overflow_error("These inputs produce a balance too large to calculate.");
	}
}

void printReport(
	const std::string& title,
	const std::vector<YearlyInvestmentResult>& rows) {
	std::cout << '\n' << title << '\n';
	std::cout << std::string(66, '=') << '\n';
	std::cout << std::left << std::setw(8) << "Year"
			  << std::right << std::setw(24) << "Year End Balance"
			  << std::setw(30) << "Year End Earned Interest" << '\n';
	std::cout << std::string(66, '-') << '\n';

	for (const YearlyInvestmentResult& row : rows) {
		std::cout << std::left << std::setw(8) << row.year
				  << std::right << "$" << std::setw(23) << std::fixed
				  << std::setprecision(2) << row.yearEndBalance
				  << "$" << std::setw(29) << std::fixed
				  << std::setprecision(2) << row.yearEndEarnedInterest
				  << '\n';
	}
}

}

Investment::Investment(
	double initialInvestment,
	double monthlyContribution,
	double annualInterestRate,
	int numberOfYears)
	: initialAmount(0.0),
	  monthlyDeposit(0.0),
	  annualInterest(0.0),
	  years(1) {
	setInitialAmount(initialInvestment);
	setMonthlyDeposit(monthlyContribution);
	setAnnualInterest(annualInterestRate);
	setYears(numberOfYears);
}

void Investment::setInitialAmount(double amount) {
	requireNonnegativeFinite(amount, "Initial investment");
	initialAmount = amount;
}

void Investment::setMonthlyDeposit(double amount) {
	requireNonnegativeFinite(amount, "Monthly deposit");
	monthlyDeposit = amount;
}

void Investment::setAnnualInterest(double annualRate) {
	requireNonnegativeFinite(annualRate, "Annual interest");
	annualInterest = annualRate;
}

void Investment::setYears(int numberOfYears) {
	requireSafeYears(numberOfYears);
	years = numberOfYears;
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

std::vector<YearlyInvestmentResult>
Investment::calculateWithoutMonthlyDeposit() const {
	std::vector<YearlyInvestmentResult> results;
	results.reserve(years);

	double total = initialAmount;
	const double monthlyRate = (annualInterest / 100.0) / 12.0;

	for (int year = 1; year <= years; ++year) {
		double yearlyInterest = 0.0;

		for (int month = 0; month < 12; ++month) {
			const double monthlyInterest = total * monthlyRate;
			total += monthlyInterest;
			yearlyInterest += monthlyInterest;
			requireFiniteProjection(total, yearlyInterest);
		}

		results.push_back({year, total, yearlyInterest});
	}

	return results;
}

std::vector<YearlyInvestmentResult>
Investment::calculateWithMonthlyDeposit() const {
	std::vector<YearlyInvestmentResult> results;
	results.reserve(years);

	double total = initialAmount;
	const double monthlyRate = (annualInterest / 100.0) / 12.0;

	for (int year = 1; year <= years; ++year) {
		double yearlyInterest = 0.0;

		for (int month = 0; month < 12; ++month) {
			// Add each deposit before calculating that month's interest, as required.
			total += monthlyDeposit;
			const double monthlyInterest = total * monthlyRate;
			total += monthlyInterest;
			yearlyInterest += monthlyInterest;
			requireFiniteProjection(total, yearlyInterest);
		}

		results.push_back({year, total, yearlyInterest});
	}

	return results;
}

void Investment::displayWithoutMonthlyDeposit() const {
	printReport(
		"Balance and Interest Without Additional Monthly Deposits",
		calculateWithoutMonthlyDeposit());
}

void Investment::displayWithMonthlyDeposit() const {
	printReport(
		"Balance and Interest With Additional Monthly Deposits",
		calculateWithMonthlyDeposit());
}
