/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: Provides the original C++ console entry point, complete-value     |
  |          input validation, confirmation pause, and report workflow.        |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

#include "investment.h"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <sstream>
#include <string>

namespace {

// End-of-file must terminate input collection rather than retry forever.
std::string readInputLine() {
	std::string input;
	if (!std::getline(std::cin, input)) {
		std::cerr << "\nInput ended before the calculation was completed.\n";
		std::exit(EXIT_FAILURE);
	}

	return input;
}

// Reads the whole line so values such as "5000abc" are rejected instead of
// accepting the numeric prefix and leaving invalid text in the input stream.
// Keep the positive and nonnegative fields on the same complete-line parser.
double readDouble(const std::string& label, bool allowZero) {
	while (true) {
		std::cout << label;
		const std::string input = readInputLine();

		std::istringstream stream(input);
		double value;
		char trailingCharacter;

		if (stream >> value &&
			!(stream >> trailingCharacter) &&
			std::isfinite(value) &&
			(value > 0.0 || (allowZero && value == 0.0))) {
			return value;
		}

		std::cout << (allowZero
			? "Please enter a valid number that is 0 or greater.\n"
			: "Please enter a valid number greater than 0.\n");
	}
}

// Years must be a complete positive integer; decimal or trailing text is
// rejected rather than partially consumed.
int readPositiveInteger(const std::string& label) {
	std::string input;

	while (true) {
		std::cout << label;
		input = readInputLine();

		std::istringstream stream(input);
		int value;
		char trailingCharacter;

		if (stream >> value &&
			!(stream >> trailingCharacter) &&
			value > 0 && value <= Investment::MaxYears) {
			return value;
		}

		std::cout << "Please enter a whole number between 1 and "
			<< Investment::MaxYears << ".\n";
	}
}

}

int main() {
	std::cout << "**************************************\n";
	std::cout << "********* Airgead Banking ************\n";
	std::cout << "**************************************\n";

	const double initialAmount =
		readDouble("Initial Investment Amount: $", false);
	const double monthlyDeposit =
		readDouble("Monthly Deposit: $", false);
	const double annualInterest =
		readDouble("Annual Interest (%): ", true);
	const int years =
		readPositiveInteger("Number of years: ");

	try {
		Investment investment(
			initialAmount,
			monthlyDeposit,
			annualInterest,
			years);

		std::cout << "\nPress Enter to continue...";
		readInputLine();

		// Validate both projections before printing either report.
		investment.calculateWithoutMonthlyDeposit();
		investment.calculateWithMonthlyDeposit();

		investment.displayWithoutMonthlyDeposit();
		investment.displayWithMonthlyDeposit();
	} catch (const std::exception& error) {
		std::cerr << "\n" << error.what() << '\n';
		return EXIT_FAILURE;
	}

	return 0;
}
