// const codewordBits = {
//     code1: [0, 1, 0, 1],
//     code2: [1, 1, 1, 0],
//     code3: [1, 0, 0, 1],
//     code4: [0, 0, 0, 1]
// };

// // Predefined erasure probability
// const epsilon = 0.2;

// function updateCodewords() {
//     const codewordsElement = document.getElementById('codewords');
//     const c1 = `c1=(${codewordBits.code1.join(', ')})`;
//     const c2 = `c2=(${codewordBits.code2.join(', ')})`;
//     const c3 = `c3=(${codewordBits.code3.join(', ')})`;
//     const c4 = `c4=(${codewordBits.code4.join(', ')})`;
//     codewordsElement.innerHTML = `Consider codeword {${c1}, ${c2}, ${c3}, ${c4}} and ε = ${epsilon}`;
// }

// // Call the function to update the content
// updateCodewords();

// function toggleReceivedBit(bitNumber) {
//     var button = document.getElementById('receivedBit' + bitNumber);
//     var currentBit = button.textContent;

//     // Toggle the bit value
//     if (currentBit === '0') {
//         button.textContent = '1';
//     } else {
//         button.textContent = '0';
//     }
// }

// // Function to reset all bits to 0
// function initial() {
//     for (var i = 1; i <= 4; i++) {
//         var button = document.getElementById('receivedBit' + i);
//         button.textContent = '0';
//     }
// }

// function calculateLikelihood(codeword, receivedBits, epsilon) {
//     let likelihood = 1;
//     for (let i = 0; i < codeword.length; i++) {
//         if (receivedBits[i] === '?') {
//             likelihood *= epsilon;
//         } else if (receivedBits[i] == codeword[i]) {
//             likelihood *= (1 - epsilon);
//         } else {
//             likelihood *= epsilon;
//         }
//     }
//     return likelihood;
// }

// function checkReceived() {
//     const receivedBits = [];
//     for (let i = 1; i <= 4; i++) {
//         receivedBits.push(document.getElementById('receivedBit' + i).textContent);
//     }

//     const likelihoods = {
//         code1: calculateLikelihood(codewordBits.code1, receivedBits, epsilon),
//         code2: calculateLikelihood(codewordBits.code2, receivedBits, epsilon),
//         code3: calculateLikelihood(codewordBits.code3, receivedBits, epsilon),
//         code4: calculateLikelihood(codewordBits.code4, receivedBits, epsilon)
//     };

//     let maxLikelihoodCode = 'code1';
//     for (let code in likelihoods) {
//         if (likelihoods[code] > likelihoods[maxLikelihoodCode]) {
//             maxLikelihoodCode = code;
//         }
//     }

//     document.getElementById('observations').innerHTML = `
//         <p>Received bits: ${receivedBits.join(', ')}</p>
//         <p>Likelihoods:</p>
//         <ul>
//             <li>c1: ${likelihoods.code1}</li>
//             <li>c2: ${likelihoods.code2}</li>
//             <li>c3: ${likelihoods.code3}</li>
//             <li>c4: ${likelihoods.code4}</li>
//         </ul>
//         <p>Maximum Likelihood Codeword: ${maxLikelihoodCode} = (${codewordBits[maxLikelihoodCode].join(', ')})</p>
//     `;
// }




//updated


const codewordBits = {
    code1: [0, 1, 0, 1],
    code2: [1, 1, 1, 0],
    code3: [1, 0, 0, 1],
    code4: [0, 0, 0, 1]
};

// Predefined erasure probability
const epsilon = 0.2;

// Track attempts
let attempts = 0;

// Update the display of codewords and erasure probability
function updateCodewords() {
    const codewordsElement = document.getElementById('codewords');
    const c1 = `c1=(${codewordBits.code1.join(', ')})`;
    const c2 = `c2=(${codewordBits.code2.join(', ')})`;
    const c3 = `c3=(${codewordBits.code3.join(', ')})`;
    const c4 = `c4=(${codewordBits.code4.join(', ')})`;
    codewordsElement.innerHTML = `Consider codeword {${c1}, ${c2}, ${c3}, ${c4}} and ε = ${epsilon}`;
}

// Call the function to update the content
updateCodewords();

// Function to toggle the received bit value
function toggleReceivedBit(bitNumber) {
    var button = document.getElementById('receivedBit' + bitNumber);
    var currentBit = button.textContent;

    // Toggle the bit value between 0 and 1
    if (currentBit === '0') {
        button.textContent = '1';
    } else {
        button.textContent = '0';
    }
}

// Function to reset all received bits to 0 and reset attempts counter
function initial() {
    for (var i = 1; i <= 4; i++) {
        var button = document.getElementById('receivedBit' + i);
        button.textContent = '0';
    }
    attempts = 0;
}

// Function to calculate the likelihood of a codeword given the received bits and epsilon
function calculateLikelihood(codeword, receivedBits, epsilon) {
    let likelihood = 1;
    for (let i = 0; i < codeword.length; i++) {
        if (receivedBits[i] === '?') {
            // If the bit is erased, multiply by epsilon
            likelihood *= epsilon;
        } else if (receivedBits[i] == codeword[i]) {
            // If the bit is correctly received, multiply by (1 - epsilon)
            likelihood *= (1 - epsilon);
        } else {
            // If the bit is incorrectly received, multiply by epsilon
            likelihood *= epsilon;
        }
    }
    // Round the likelihood to one decimal place
    return parseFloat(likelihood.toFixed(2));
}

// Function to check the received bits and user-entered likelihoods
function checkReceived() {
    const receivedBits = [];
    for (let i = 1; i <= 4; i++) {
        receivedBits.push(document.getElementById('receivedBit' + i).textContent);
    }

    // Calculate the likelihoods for each codeword
    const likelihoods = {
        code1: calculateLikelihood(codewordBits.code1, receivedBits, epsilon),
        code2: calculateLikelihood(codewordBits.code2, receivedBits, epsilon),
        code3: calculateLikelihood(codewordBits.code3, receivedBits, epsilon),
        code4: calculateLikelihood(codewordBits.code4, receivedBits, epsilon)
    };

    // Check user-entered likelihoods and provide feedback
    const feedback = checkUserInput(likelihoods);

    document.getElementById('observations').innerHTML = feedback;

    if (feedback === 'All likelihoods are correct!') {
        // Find the codeword with the maximum likelihood
        let maxLikelihoodCode = 'code1';
        for (let code in likelihoods) {
            if (likelihoods[code] > likelihoods[maxLikelihoodCode]) {
                maxLikelihoodCode = code;
            }
        }

        // Update the user input for maximum likelihood estimate
        const maxLikelihoodInput = document.querySelector('.input-likeli[maxlikelihood]');
        if (maxLikelihoodInput) {
            maxLikelihoodInput.value = `${likelihoods[maxLikelihoodCode]}`;
        }

        // Display the maximum likelihood codeword and value
        document.getElementById('observations').innerHTML += `
            <p>Maximum Likelihood Codeword: ${maxLikelihoodCode} = (${codewordBits[maxLikelihoodCode].join(', ')})</p>
            <p>Maximum Likelihood Value: ${likelihoods[maxLikelihoodCode]}</p>
        `;
    } else {
        attempts++;
        if (attempts >= 3) {
            // Display correct likelihoods after 3 attempts
            document.getElementById('observations').innerHTML += '<br>Attempts exceeded. Correct likelihoods are:<br>' +
                `c1: ${likelihoods.code1}<br>` +
                `c2: ${likelihoods.code2}<br>` +
                `c3: ${likelihoods.code3}<br>` +
                `c4: ${likelihoods.code4}`;
        }
    }
}

// Function to check user-entered likelihoods and provide guidance if incorrect
function checkUserInput(correctLikelihoods) {
    const inputs = document.querySelectorAll('.input-likeli');
    const feedback = [];
    inputs.forEach((input, index) => {
        const userValue = parseFloat(input.value);
        const code = `code${index + 1}`;
        if (!input.value) {
            feedback.push(`Please enter the likelihood for c${index + 1}.`);
        } else if (userValue !== correctLikelihoods[code]) {
            if (userValue > correctLikelihoods[code]) {
                feedback.push(`The likelihood for c${index + 1} is too high. Try a lower value.`);
            } else {
                feedback.push(`The likelihood for c${index + 1} is too low. Try a higher value.`);
            }
        }
    });

    // Return feedback messages or indicate all likelihoods are correct
    return feedback.length > 0 ? feedback.join('<br>') : 'All likelihoods are correct!';
}
