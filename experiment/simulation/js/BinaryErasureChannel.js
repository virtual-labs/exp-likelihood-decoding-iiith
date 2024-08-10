// Function to randomly choose between two options
function chooseRandomly(option1, option2) {
    return Math.random() < 0.5 ? option1 : option2;
}

// Function to generate a random binary matrix of given dimensions
function generateRandomBinaryMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(Math.round(Math.random())); // Random binary number (0 or 1)
        }
        matrix.push(row);
    }
    return matrix;
}

// Function to generate codewords for a matrix
function generateCodewords(matrix) {
    const codewords = [];
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Generate all possible message vectors of length numRows
    for (let i = 0; (1 << numRows) > i; i++) {
        const messageVector = Array(numRows).fill(0).map((_, bit) => (i >> bit) & 1);
        const codeword = matrix[0].map((_, colIndex) => {
            return matrix.reduce((sum, row, rowIndex) => (sum + row[colIndex] * messageVector[rowIndex]) % 2, 0);
        });
        codewords.push(codeword);
    }

    return codewords;
}

// Function to introduce random erasures in a codeword
function introduceErasures(codeword) {
    let hasErasure = false;

    // Apply erasures with a 50% chance
    const erasedCodeword = codeword.map(bit => {
        const isErased = Math.random() < 0.5;
        if (isErased) {
            hasErasure = true;
            return '?';
        }
        return bit;
    });

    // If no erasure occurred, force an erasure on a random position
    if (!hasErasure) {
        const randomIndex = Math.floor(Math.random() * codeword.length);
        erasedCodeword[randomIndex] = '?';
    }

    return erasedCodeword;
}

// Randomly choose the number of rows (2 or 3) and columns (4 or 5)
const rows = chooseRandomly(2, 3);
const cols = chooseRandomly(4, 5);

// Generate a random binary matrix
const G = generateRandomBinaryMatrix(rows, cols);
console.log('Generated Matrix:', G);

// Generate all codewords
let codewords = generateCodewords(G);
console.log('Generated Codewords:', codewords);

// Choose a single random codeword from the generated codewords
let chosenCodeword = codewords[Math.floor(Math.random() * codewords.length)];
console.log('Chosen Codeword (before erasures):', chosenCodeword);

// Apply erasures to the chosen codeword
let receivedCodeword = introduceErasures(chosenCodeword);
console.log('Received Codeword (with erasures):', receivedCodeword);

const epsilon = 0.2;

// Function to calculate the likelihood of each codeword given the received codeword
function calculateLikelihood(codewords, receivedCodeword, epsilon) {
    let likelihoods = [];

    codewords.forEach((codeword, index) => {
        let isCompatible = true;
        let numNonErasures = 0;
        let numErasures = 0;

        // Check compatibility and count non-erasure/erasure bits
        for (let i = 0; i < codeword.length; i++) {
            if (receivedCodeword[i] !== '?' && receivedCodeword[i] !== codeword[i]) {
                isCompatible = false;
                break;
            }
            if (receivedCodeword[i] !== '?') {
                numNonErasures++;
            } else {
                numErasures++;
            }
        }

        if (isCompatible) {
            // Calculate likelihood for compatible codewords
            console.log(numErasures, numNonErasures)
            const likelihood = Math.pow(epsilon, numErasures) * Math.pow(1 - epsilon, numNonErasures);
            likelihoods.push({
                codeword: index,
                likelihood: parseFloat(likelihood.toFixed(3))
            });
        } else {
            // Incompatible codewords have a likelihood of 0
            likelihoods.push({
                codeword: index,
                likelihood: 0
            });
        }
    });

    console.log(likelihoods)

    return likelihoods;
}

// Function to update the HTML content with the chosen codeword
function updateCodewords() {
    const codewordsElementErasure = document.getElementById('codewordsErasure');
    const codewordsElement = document.getElementById('codewords');

    let codewordsText = '';
    codewords.forEach((value, index) => {
        codewordsText += `c${index + 1}=(${value.join(', ')}) `;
    });
    codewordsElement.innerHTML = `Consider codewords {${codewordsText}} and &#949; = ${epsilon}`;

    // Generate HTML for likelihood calculations dynamically
    let likelihoodHTML = '';
    codewords.forEach((_, index) => {
        likelihoodHTML += `
            <div id="powerText">
                <span><u>p(y|c${index + 1})</u></span>= &#949;<sup><input type="number" class="superscript" id="c${index + 1}_power1" min="0"></sup>
                (1-&#949;)<sup><input type="number" class="superscript" id="c${index + 1}_power2" min="0"></sup>
                = <input type="number" class="input-likeli" id="c${index + 1}_likelihood">
            </div>
        `;
    });
    codewordsElementErasure.innerHTML = `Enter the likelihood of y = (${receivedCodeword.join(', ')}) given various codewords ; ${likelihoodHTML}`;
}

// Function to check the user-entered likelihoods and provide feedback
function checkLikelihood() {
    const likelihoods = calculateLikelihood(codewords, receivedCodeword, epsilon);

    // Calculate the maximum likelihood
    let maxLikelihood = 0;
    likelihoods.forEach((likeli, index) => {
        if (likeli.likelihood > maxLikelihood) {
            maxLikelihood = likeli.likelihood;
            maxLikelihoodIndex = index;
        }
    });

    // Retrieve the user-entered likelihood from the input field
    const maxEntered = parseFloat(document.getElementById('max_likelihood').value);
    // Provide feedback based on comparison
    const feedback = maxEntered === maxLikelihood
        ? 'The entered maximum likelihood is correct.'
        : `The entered maximum likelihood is incorrect.`;

    document.getElementById('observations').innerHTML = feedback;
}

// Function to reset all received bits to 0 and reset attempts counter
function reset() {
    document.querySelectorAll('.input-likeli').forEach(input => {
        input.value = '';
    });
    document.getElementById('observations').innerHTML = '';
}

// Call the function to update the content
updateCodewords();
