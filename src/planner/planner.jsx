import React, { useState } from 'react';
import "./planner.css";

function RetirementPlanner() {
    const [formData, setFormData] = useState({
        currentAge: '',
        retirementAge: '',
        lifeExpectancy: '',
        monthlyExpenses: '',
        expenseFactor: '',
        inflation: '',
        preExistingCorpus: '',
        annualReturnRate: ''
    });
    const [results, setResults] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const calculateRetirement = () => {
        // Convert strings to numbers
        const formDataNum = Object.keys(formData).reduce((acc, key) => {
            acc[key] = parseFloat(formData[key]);
            return acc;
        }, {});

        // Destructure form data
        const {
            currentAge,
            retirementAge,
            lifeExpectancy,
            monthlyExpenses,
            expenseFactor,
            inflation,
            preExistingCorpus,
            annualReturnRate
        } = formDataNum;

        // Calculate the number of years in retirement
        const yearsInRetirement = lifeExpectancy - retirementAge;

        // Calculate the future monthly expenses at retirement age
        let futureMonthlyExpenses = monthlyExpenses * Math.pow((1 + inflation/100), (retirementAge - currentAge));

        // Calculate the future annual expenses at retirement age
        let futureAnnualExpenses = futureMonthlyExpenses * 12;

        // Calculate the total retirement corpus needed
        let totalRetirementCorpus = futureAnnualExpenses * yearsInRetirement;

        // Calculate the additional corpus needed
        let additionalCorpusNeeded = totalRetirementCorpus - preExistingCorpus;

        // Calculate the monthly savings needed
        let yearsToRetirement = retirementAge - currentAge;
        let monthlySavingsNeeded = additionalCorpusNeeded / (((1 + annualReturnRate/1200) ** (yearsToRetirement * 12) - 1) / (annualReturnRate/1200));

        // Calculate the growth of the pre-existing corpus
        let preExistingCorpusGrowth = preExistingCorpus * ((1 + annualReturnRate/1200) ** (yearsToRetirement * 12) - 1);

        // Calculate the total savings at retirement
        let totalSavingsAtRetirement = preExistingCorpusGrowth + (monthlySavingsNeeded * 12 * yearsToRetirement * ((1 + annualReturnRate/1200) ** (yearsToRetirement * 12) - 1) / (annualReturnRate/1200));

        // Set the results
        setResults({
            totalRetirementCorpus: totalRetirementCorpus.toFixed(2),
            additionalCorpusNeeded: additionalCorpusNeeded.toFixed(2),
            monthlySavingsNeeded: monthlySavingsNeeded.toFixed(2),
            preExistingCorpusGrowth: preExistingCorpusGrowth.toFixed(2),
            totalSavingsAtRetirement: totalSavingsAtRetirement.toFixed(2)
        });

        const resultsElement = document.getElementById("results");
    resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className='master-container'>
        <div className='planner-column-flex-container'><h1 style={{color:"white"}} className='centered-text'>Retirement Planner</h1></div>
        <br/>
            <div className='planner-column-flex-container'>
            <label>Current Age:<br/>
                <input type="number" name="currentAge" value={formData.currentAge} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Retirement Age:<br/>
                <input type="number" name="retirementAge" value={formData.retirementAge} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Life Expectancy:<br/>
                <input type="number" name="lifeExpectancy" value={formData.lifeExpectancy} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Monthly Expenses:<br/>
                <input type="number" name="monthlyExpenses" value={formData.monthlyExpenses} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Expense Factor:<br/>
                <input type="number" name="expenseFactor" value={formData.expenseFactor} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Inflation:<br/>
                <input type="number" name="inflation" value={formData.inflation} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Pre-existing Retirement Corpus:<br/>
                <input type="number" name="preExistingCorpus" value={formData.preExistingCorpus} onChange={handleChange} className="input-field"/>
            </label><br />
            <label>Annual Return Rate:<br/>
                <input type="number" name="annualReturnRate" value={formData.annualReturnRate} onChange={handleChange} className="input-field"/>
            </label><br />
            <button onClick={calculateRetirement} className="planner-button">Calculate</button>
            </div>
            <br/>
            {results && (
                <div id="results" className='planner-column-flex-container'>
                    <p>Total retirement corpus needed: {results.totalRetirementCorpus}</p>
                    <p>Additional corpus needed: {results.additionalCorpusNeeded}</p>
                    <p>Monthly savings needed: {results.monthlySavingsNeeded}</p>
                    <p>Growth of pre-existing corpus: {results.preExistingCorpusGrowth}</p>
                    <p>Total savings at retirement: {results.totalSavingsAtRetirement}</p>
                </div>
            )}
        </div>
    );
}

export default RetirementPlanner;
