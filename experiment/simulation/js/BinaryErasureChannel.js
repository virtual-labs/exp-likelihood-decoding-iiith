const GeneratorMatrices = [
    {
        name: "G1",
        gen: [[1,0,0,1],[0,1,1,1]]},
    {
        name: "G2",
        gen: [[1,0,0,0,1,1],[0,1,0,1,0,1],[0,0,1,1,1,0]]},
    {
        name: "G3",
        gen: [[1,0,1,1,0],[0,1,0,1,1],[0,0,1,0,1]]},
]

const extravectors = [[1,1,0,0],[0,1,0,1],[0,1,1,0],[1,1,1,1]];


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
    // Decide randomly whether to introduce 1 or 2 erasures
    const numErasures = Math.random() < 0.5 ? 1 : 2;

    // Create a set of unique random positions to erase
    const erasurePositions = new Set();

    while (erasurePositions.size < numErasures) {
        const randomIndex = Math.floor(Math.random() * codeword.length);
        erasurePositions.add(randomIndex);
    }

    // Apply the erasures to the codeword
    const erasedCodeword = codeword.map((bit, index) => (
        erasurePositions.has(index) ? '?' : bit
    ));

    return erasedCodeword;
}

function introduceMoreErasures(newcodewords) {
    // Decide randomly whether to introduce 1 or 2 erasures
    if (newcodewords.length === 4){
        numErasures = Math.random() < 0.5 ? 2 : 3;
    }
    else {
        numErasures = Math.random() < 0.5 ? 3 : 4;
    }

    // Create a set of unique random positions to erase
    const erasurePositions = new Set();

    while (erasurePositions.size < numErasures) {
        const randomIndex = Math.floor(Math.random() * newcodewords.length);
        erasurePositions.add(randomIndex);
    }

    // Apply the erasures to the codeword
    const erasedCodeword = newcodewords.map((bit, index) => (
        erasurePositions.has(index) ? '?' : bit
    ));

    return erasedCodeword;
}

const randomNum = Math.floor(Math.random() * 3);

// Generate a random binary matrix
G = GeneratorMatrices[randomNum].gen;

// Generate all codewords
let codewords = generateCodewords(G);

// Choose a single random codeword from the generated codewords
let chosenCodeword = codewords[Math.floor(Math.random() * codewords.length)];

// Apply erasures to the chosen codeword
let receivedCodeword = introduceErasures(chosenCodeword);


const epsilon = 0.2;

GM = GeneratorMatrices[randomNum].gen;

let newcodewords = generateCodewords(GM);
let newchosenCodeword = newcodewords[Math.floor(Math.random() * newcodewords.length)];

let receivedOutput = introduceMoreErasures(newchosenCodeword);

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
            const likelihood = Math.pow(epsilon, numErasures) * Math.pow(1 - epsilon, numNonErasures);
            likelihoods.push({
                codeword: index,
                likelihood: parseFloat(likelihood),
                compatibility: true,
                ne: parseInt(numErasures),
                nne: parseInt(numNonErasures)
            });
        } else {
            // Incompatible codewords have a likelihood of 0
            likelihoods.push({
                codeword: index,
                likelihood: 0,
                compatibility: false,
                ne: 0,
                nne: 0
            });
        }
    });

    return likelihoods;
}

// Function to update the HTML content with the chosen codeword
function updateCodewords() {
    const codewordsElementErasure = document.getElementById('codewordsErasure');
    const codewordsElement = document.getElementById('codewords');
    const maxlikelihoodans = document.getElementById('dropdowncodewords');

    let codewordsText = '';
    codewords.forEach((value, index) => {
        codewordsText += `\\( \\boldsymbol{c_${index + 1}} \\) = (${value.join(', ')}), `;
    });
    codewordsElement.innerHTML = `Consider a BEC Channel with &#949; = ${epsilon} and a code \\( \\mathcal{C} \\) = {${codewordsText}}`;

    // Generate HTML for likelihood calculations dynamically
    let likelihoodHTML = '';
    codewords.forEach((_, index) => {
        likelihoodHTML += `
            <div id="powerText">
                <span> \\( \\boldsymbol{p(y|c_${index + 1})} \\)</span> = <i>&#949;</i><sup><input type="number" class="superscript" id="c${index + 1}_power1" min="0"></sup>
                <i>(1-&#949;)</i><sup><input type="number" class="superscript" id="c${index + 1}_power2" min="0"></sup>
                = <input type="number" class="input-likeli" id="c${index + 1}_likelihood">
            </div>
        `;
    });
    codewords.forEach((value, index) => {
        maxlikelihoodans.innerHTML += `<a onclick="verifyMaxLikelihood(${index})" id="c${index + 1}">\\( c_${index + 1} \\)</a>`
    });
    codewordsElementErasure.innerHTML = `Enter the likelihood of receiving the output vector \\( \\boldsymbol{y} \\) = (${receivedCodeword.join(', ')}) given each of the codewords. Then select the codeword that has the maximum likelihood of being transmitted. ${likelihoodHTML}`;
}

const likelihoods = calculateLikelihood(codewords, receivedCodeword, epsilon);

// Function to check the user-entered likelihoods and provide feedback
function checkLikelihood() {
    let likelihoodarray = [];
    let erasurearray1 = [];
    let erasurearray2 = [];
    const epsilonerror = 0.1;

    codewords.forEach((value, index) => {
        let cw = document.getElementById(`c${index + 1}_likelihood`);
        let er1 = document.getElementById(`c${index + 1}_power1`);
        let er2 = document.getElementById(`c${index + 1}_power2`);

        likelihoodarray[index] = parseFloat(cw.value);
        erasurearray1[index] = parseInt(er1.value);
        erasurearray2[index] = parseInt(er2.value);
    });

    const p1obsa = document.getElementById('mEntered');
    

    if(likelihoodarray.length === 4){
        switch (true) {
            case (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]) && likelihoods[1].likelihood != parseFloat(likelihoodarray[1]) && likelihoods[2].likelihood != parseFloat(likelihoodarray[2]) && likelihoods[3].likelihood != parseFloat(likelihoodarray[3])):
                p1obsa.innerHTML = "Incorrect Answers! <br> Please go through the Instructions and try again.";
                p1obsa.style.color = "red";
                break;

            case ((likelihoods[0].ne != parseInt(erasurearray1[0])) || (likelihoods[0].nne != parseInt(erasurearray2[0])) || Math.abs(likelihoods[0].likelihood - parseFloat(likelihoodarray[0])) >= epsilonerror):
                if(!likelihoods[0].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_1 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[0].nne != parseInt(erasurearray2[0])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[0].ne != parseInt(erasurearray1[0])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_1 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }
            
            case ((likelihoods[1].ne != parseInt(erasurearray1[1])) || (likelihoods[1].nne != parseInt(erasurearray2[1])) || Math.abs(likelihoods[1].likelihood - parseFloat(likelihoodarray[1])) >= epsilonerror):
                if(!likelihoods[1].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_2 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[1].nne != parseInt(erasurearray2[1])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[1].ne != parseInt(erasurearray1[1])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_2 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[2].ne != parseInt(erasurearray1[2])) || (likelihoods[2].nne != parseInt(erasurearray2[2])) || Math.abs(likelihoods[2].likelihood - parseFloat(likelihoodarray[2])) >= epsilonerror):
                if(!likelihoods[2].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_3 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[2].nne != parseInt(erasurearray2[2])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[2].ne != parseInt(erasurearray1[2])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_3 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[3].ne != parseInt(erasurearray1[3])) || (likelihoods[3].nne != parseInt(erasurearray2[3])) || Math.abs(likelihoods[3].likelihood - parseFloat(likelihoodarray[3])) >= epsilonerror):
                if(!likelihoods[3].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_4 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[3].nne != parseInt(erasurearray2[3])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[3].ne != parseInt(erasurearray1[3])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_4 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }
        
            default:
                p1obsa.innerHTML = "All the likelihoods entered are correct!";
                p1obsa.style.color = "green";
                break;
        }
    }
    else{
        switch (true) {

            case (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]) && likelihoods[1].likelihood != parseFloat(likelihoodarray[1]) && likelihoods[2].likelihood != parseFloat(likelihoodarray[2]) && likelihoods[3].likelihood != parseFloat(likelihoodarray[3]) && likelihoods[4].likelihood != parseFloat(likelihoodarray[4]) && likelihoods[5].likelihood != parseFloat(likelihoodarray[5]) && likelihoods[6].likelihood != parseFloat(likelihoodarray[6]) && likelihoods[7].likelihood != parseFloat(likelihoodarray[7])):
                p1obsa.innerHTML = "Incorrect Answer! <br> Please go through the Instructions, and try again.";
                p1obsa.style.color = "red";
                break;
            
            case ((likelihoods[0].ne != parseInt(erasurearray1[0])) || (likelihoods[0].nne != parseInt(erasurearray2[0])) || Math.abs(likelihoods[0].likelihood - parseFloat(likelihoodarray[0])) >= epsilonerror):
                if(!likelihoods[0].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_1 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[0].nne != parseInt(erasurearray2[0])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[0].ne != parseInt(erasurearray1[0])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_1 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }
            
            case ((likelihoods[1].ne != parseInt(erasurearray1[1])) || (likelihoods[1].nne != parseInt(erasurearray2[1])) || Math.abs(likelihoods[1].likelihood - parseFloat(likelihoodarray[1])) >= epsilonerror):
                if(!likelihoods[1].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_2 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[1].nne != parseInt(erasurearray2[1])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[1].ne != parseInt(erasurearray1[1])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_2 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[2].ne != parseInt(erasurearray1[2])) || (likelihoods[2].nne != parseInt(erasurearray2[2])) || Math.abs(likelihoods[2].likelihood - parseFloat(likelihoodarray[2])) >= epsilonerror):
                if(!likelihoods[2].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_3 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[2].nne != parseInt(erasurearray2[2])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[2].ne != parseInt(erasurearray1[2])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_3 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[3].ne != parseInt(erasurearray1[3])) || (likelihoods[3].nne != parseInt(erasurearray2[3])) || Math.abs(likelihoods[3].likelihood - parseFloat(likelihoodarray[3])) >= epsilonerror):
                if(!likelihoods[3].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_4 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[3].nne != parseInt(erasurearray2[3])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[3].ne != parseInt(erasurearray1[3])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_4 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[4].ne != parseInt(erasurearray1[4])) || (likelihoods[4].nne != parseInt(erasurearray2[4])) || Math.abs(likelihoods[4].likelihood - parseFloat(likelihoodarray[4])) >= epsilonerror):
                if(!likelihoods[4].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_5 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[4].nne != parseInt(erasurearray2[4])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_5 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[4].ne != parseInt(erasurearray1[4])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_5 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_5 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }
            
            case ((likelihoods[5].ne != parseInt(erasurearray1[5])) || (likelihoods[5].nne != parseInt(erasurearray2[5])) || Math.abs(likelihoods[5].likelihood - parseFloat(likelihoodarray[5])) >= epsilonerror):
                if(!likelihoods[5].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_6 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[5].nne != parseInt(erasurearray2[5])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_6 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[5].ne != parseInt(erasurearray1[5])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_6 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_6 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[6].ne != parseInt(erasurearray1[6])) || (likelihoods[6].nne != parseInt(erasurearray2[6])) || Math.abs(likelihoods[6].likelihood - parseFloat(likelihoodarray[6])) >= epsilonerror):
                if(!likelihoods[6].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_7 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[6].nne != parseInt(erasurearray2[6])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_7 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[6].ne != parseInt(erasurearray1[6])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_7 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_7 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }

            case ((likelihoods[7].ne != parseInt(erasurearray1[7])) || (likelihoods[7].nne != parseInt(erasurearray2[7])) || Math.abs(likelihoods[7].likelihood - parseFloat(likelihoodarray[7])) >= epsilonerror):
                if(!likelihoods[7].compatibility){
                    p1obsa.innerHTML = `Check if the codeword and the received vector are compatible, with respect to the codeword \\( c_8 \\). If they are not compatible, enter 0 as the result in the boxes corresponding to the codeword. If it is compatible, make sure you enter the right number of erasures and non-erasures and the final correct answer.`;
                    p1obsa.style.color = "red";
                    break;
                }
                else{
                    if(likelihoods[7].nne != parseInt(erasurearray2[7])){
                        p1obsa.innerHTML = `Kindly check the number of non-erasures in the received vector for the codeword \\( c_8 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[7].ne != parseInt(erasurearray1[7])){
                        p1obsa.innerHTML = `Kindly check the number of erasures in the received vector for the codeword \\( c_8 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of erasures and non-erasures and enter the correct answer for the codeword \\( c_8 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
                }
        
            default:
                p1obsa.innerHTML = "All the likelihoods entered are correct!";
                p1obsa.style.color = "green";
                break;
        }
    }

    MathJax.typesetPromise();

    console.log(likelihoods);
    console.log(likelihoodarray);
    console.log(erasurearray1);
    console.log(erasurearray2);
}

function verifyMaxLikelihood(code) {
    
    const buttonText = document.getElementById("dropbuttonText");

    let maxLikelihood = 0;
    let maxLikelihoodIndex = 0;

    buttonText.innerHTML = "\\(\\boldsymbol{c_" + parseInt(code + 1, 10) + "}\\)";

    likelihoods.forEach((likeli, index) => {
        if (likeli.likelihood > maxLikelihood) {
            maxLikelihood = likeli.likelihood;
            maxLikelihoodIndex = index;
        }
    });

    const p1obsb = document.getElementById('cEntered');

    if (code === maxLikelihoodIndex){
        p1obsb.innerHTML = "The maximum likelihood codeword selected is correct.";
        p1obsb.style.color = "green";
    }
    else{
        p1obsb.innerHTML = "The maximum likelihood codeword selected is incorrect.";
        p1obsb.style.color = "red";
    }

    MathJax.typesetPromise();
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

var buttonIdentityBEC = ["j1", "j2", "j3", "j4","j5", "j6", "j7", "j8"];

const buttonIdentity = buttonIdentityBEC.slice();

var correctbuttons = [];
var wrongbuttons = [];

var correctcodewordsarray = [];
var wrongcodewordsarray = [];

for (let i = buttonIdentity.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [buttonIdentity[i], buttonIdentity[j]] = [buttonIdentity[j], buttonIdentity[i]];
}

function next(){

    document.getElementById("part2").style.display = "block";
    document.getElementById("part1").style.display = "none";

    buttonIdentity.forEach(function(buttonId) {
        // Get the button element
        var buttons = document.getElementById(buttonId);
        
        // Set the random number as the button's text
        buttons.style.backgroundColor = "";
    });

    const codewordsElements = document.getElementById('linearcode');
    const transmittedcodeword = document.getElementById('transmittedcodeword');

    let codewordstxt = '';
    newcodewords.forEach((value, index) => {
        codewordstxt += `\\( \\boldsymbol{c_${index + 1}} \\) = (${value.join(', ')}), `;
    });
    codewordsElements.innerHTML = `Consider the code \\( \\mathcal{C} \\) = {${codewordstxt}}`;

    transmittedcodeword.innerHTML = `Consider a output \\( \\boldsymbol{y} \\) = (${receivedOutput.join(', ')}) that was received from a BEC Channel. Select all of the below vectors which cannot be the possible codeword inputs to the BEC Channel.`;

    var i = 0;


    buttonIdentity.forEach(function(wansbutton) {
        // Get the button element
        var buttonw = document.getElementById(wansbutton);

        if((newcodewords[0].length) === 4){
            if(i >= 4){
                randomcodewords = extravectors[i-4];
            }
            else{
                randomcodewords = newcodewords[i];
            }
        }
        else{
            randomcodewords = newcodewords[i];
        }
        
        let isnewCompatible = true;
    
        for (let i = 0; i < randomcodewords.length; i++) {
            if ((receivedOutput[i] !== '?' && receivedOutput[i] !== randomcodewords[i]) || !newcodewords.includes(randomcodewords)) {
                isnewCompatible = false;
                break;
            }
        }
    
        if (isnewCompatible) {
            if (!wrongbuttons.includes(buttonw.id)){
                wrongcodewordsarray.push(randomcodewords);
                wrongbuttons.push(buttonw.id);
            }
        } else {
            if (!correctbuttons.includes(buttonw.id)){
            correctcodewordsarray.push(randomcodewords);
            correctbuttons.push(buttonw.id);
            }
        }

        buttonw.innerHTML = `<span style="font-size: 20px; font-weight: bold; color: black;">` + `(${randomcodewords.join(', ')})` + `</span>`;
        i = i + 1;
    });

    MathJax.typesetPromise();
    
}

var array2 = [];

function change(id) {
    const element = document.getElementById(id);

    if (element.style.backgroundColor === "rgb(26, 255, 0)") {
        element.style.backgroundColor = "rgb(200, 200, 200)";
            const index = array2.indexOf(id);
            if (index !== -1) {
                array2.splice(index, 1);
            }
}   else {
        element.style.backgroundColor = "rgb(26, 255, 0)";
        array2.push(id);
    }
}

function checkwrongcodewords(){
    const newobservations = document.getElementById("newobservations");
    const newcEntered = document.getElementById("newcEntered");
    const selectedCodewords = document.querySelectorAll('#part2 .outputcw button[style="background-color: rgb(26, 255, 0);"]');

    if (selectedCodewords.length == 0) {
        newobservations.innerHTML = "No codeword has been selected. Kindly choose the codewords by clicking on them.";
        newobservations.style.color = "black";
    }
    else {
        const selectedIds = Array.from(selectedCodewords).map(button => button.id);
        const correctIds = correctbuttons.slice();
        const isCorrect = correctIds.every(id => selectedIds.includes(id)) && selectedIds.length === correctIds.length;


        if (isCorrect) {
            newobservations.innerHTML = "";
            correctcodewordsarray.forEach(function(ccarray){
                newobservations.innerHTML += `(${ccarray})`;
        });
            newobservations.innerHTML += `<br><b>Correct! The above selected codewords are indeed the wrong possible choices for input codewords to the given BEC channel.</b>`;
            newobservations.style.color = "green";
            newcEntered.innerHTML = "";
        } else {
            newobservations.innerHTML = "<b>Incorrect! Note that the options that you have selected should either not be a codeword or is a codeword, but not compatible with the output.In case of further doubts, kindly refer to the theory.</b>";
            newobservations.style.color = "red";
            newcEntered.innerHTML = "";
        }
    }
}

function prev(){
    document.getElementById("part2").style.display = "none";
    document.getElementById("part1").style.display = "block";
}