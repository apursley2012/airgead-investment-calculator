/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: Provides deterministic regression tests for the original C++      |
  |          calculation behavior, including deposit timing and zero-rate      |
  |          scenarios.                                                        |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

#include "../investment.h"

#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
#include <stdexcept>

namespace {

bool nearlyEqual(double left, double right, double tolerance = 1e-6) {
	return std::fabs(left - right) <= tolerance;
}

}

int main() {
	Investment investment(5000.0, 250.0, 5.0, 20);

	const auto withoutDeposits =
		investment.calculateWithoutMonthlyDeposit();
	const auto withDeposits =
		investment.calculateWithMonthlyDeposit();

	assert(withoutDeposits.size() == 20);
	assert(withDeposits.size() == 20);

	// Expected values lock the C++ deposit-before-interest calculation contract.
	assert(nearlyEqual(
		withoutDeposits.back().yearEndBalance,
		13563.201427409993));
	assert(nearlyEqual(
		withDeposits.back().yearEndBalance,
		116749.7786277003));
	assert(nearlyEqual(
		withoutDeposits.back().yearEndEarnedInterest,
		660.1448623441268));
	assert(nearlyEqual(
		withDeposits.back().yearEndEarnedInterest,
		5614.890453590851));

	Investment zeroRate(1000.0, 100.0, 0.0, 1);
	const auto zeroRateRows =
		zeroRate.calculateWithMonthlyDeposit();

	assert(zeroRateRows.size() == 1);
	assert(nearlyEqual(
		zeroRateRows.back().yearEndBalance,
		2200.0));
	assert(nearlyEqual(
		zeroRateRows.back().yearEndEarnedInterest,
		0.0));

	// Public Investment APIs reject unsafe state instead of allocating an
	// unbounded number of yearly result rows.
	bool rejectedYears = false;
	try {
		Investment tooManyYears(1000.0, 100.0, 5.0, Investment::MaxYears + 1);
	} catch (const std::invalid_argument&) {
		rejectedYears = true;
	}
	assert(rejectedYears);

	Investment bounded(1000.0, 100.0, 5.0, 1);
	rejectedYears = false;
	try {
		bounded.setYears(Investment::MaxYears + 1);
	} catch (const std::invalid_argument&) {
		rejectedYears = true;
	}
	assert(rejectedYears);
	assert(bounded.getYears() == 1);

	bool rejectedInvalidRate = false;
	try {
		bounded.setAnnualInterest(std::numeric_limits<double>::infinity());
	} catch (const std::invalid_argument&) {
		rejectedInvalidRate = true;
	}
	assert(rejectedInvalidRate);
	assert(bounded.getAnnualInterest() == 5.0);

	bool detectedOverflow = false;
	try {
		Investment huge(
			std::numeric_limits<double>::max(),
			std::numeric_limits<double>::max(),
			1.0,
			1);
		huge.calculateWithMonthlyDeposit();
	} catch (const std::overflow_error&) {
		detectedOverflow = true;
	}
	assert(detectedOverflow);


	// Zero deposits should produce the same annual balances in both reports.
	Investment noContributions(500.0, 0.0, 4.0, 5);
	const auto zeroDepositWithout = noContributions.calculateWithoutMonthlyDeposit();
	const auto zeroDepositWith = noContributions.calculateWithMonthlyDeposit();
	for (std::size_t i = 0; i < zeroDepositWith.size(); ++i) {
		assert(zeroDepositWith[i].year == zeroDepositWithout[i].year);
		assert(nearlyEqual(
			zeroDepositWith[i].yearEndBalance,
			zeroDepositWithout[i].yearEndBalance));
		assert(nearlyEqual(
			zeroDepositWith[i].yearEndEarnedInterest,
			zeroDepositWithout[i].yearEndEarnedInterest));
	}

	// At zero interest, principal rises by exactly twelve monthly deposits yearly.
	Investment zeroInterest(500.0, 25.0, 0.0, 3);
	const auto zeroInterestRows = zeroInterest.calculateWithMonthlyDeposit();
	for (std::size_t i = 0; i < zeroInterestRows.size(); ++i) {
		assert(zeroInterestRows[i].year == static_cast<int>(i + 1));
		assert(nearlyEqual(
			zeroInterestRows[i].yearEndBalance,
			500.0 + (i + 1) * 12.0 * 25.0));
		assert(nearlyEqual(zeroInterestRows[i].yearEndEarnedInterest, 0.0));
	}

	// Boundary years and invalid setters must preserve the last valid state.
	Investment maxDuration(1.0, 0.0, 0.0, Investment::MaxYears);
	assert(maxDuration.calculateWithMonthlyDeposit().size() ==
		static_cast<std::size_t>(Investment::MaxYears));

	bool rejectedInvalidDeposit = false;
	try {
		bounded.setMonthlyDeposit(-1.0);
	} catch (const std::invalid_argument&) {
		rejectedInvalidDeposit = true;
	}
	assert(rejectedInvalidDeposit);
	assert(nearlyEqual(bounded.getMonthlyDeposit(), 100.0));

	bool rejectedInvalidInitial = false;
	try {
		bounded.setInitialAmount(std::numeric_limits<double>::quiet_NaN());
	} catch (const std::invalid_argument&) {
		rejectedInvalidInitial = true;
	}
	assert(rejectedInvalidInitial);
	assert(nearlyEqual(bounded.getInitialAmount(), 1000.0));

	std::cout << "C++ investment regression tests passed.\n";
	return 0;
}
