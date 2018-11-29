Linear codes extension for Numbas
==========================

This extension provides a new data type and some functions to deal with linear codes.

JME data types
--------------

This extension adds two new JME data types, `Numbas.jme.types.codeword` and `Numbas.jme.types.code`.

JME functions
-------------

### `codeword(digits,field_size)`

Create a codeword from a list or vector of digits, in Z_{field_size}. For example, `codeword([1,1,0,1],2)`

### `codeword(word_string,field_size)`

Create a codeword from a string of digits, in Z_{field_size}. For example, `codeword("11001",2)`

### `zero(word_length,field_size)`

The zero word of the given length in the field Z_{field_size}.

### `is_zero(word)`

Is `word` a zero word (are all its digits 0)?

### `latex(codeword)`

A LaTeX rendering of the given codeword.

### `word1+word2`

Add two codewords. 

### `word1-word2`

Subtract one codeword from another.

### `n*word` or `word*n`

Multiply a codeword by a scalar.

### `word[n]`

nth digit of codeword.

### `word[m..n]`

List of mth to nth digits of codeword.

### `weight(w)`

Hamming weight of the word.

### `allwords(word_length,field_size)`

Generate a list of all codewords of given length in Z_{field_size}.

### `random_word(word_length,field_size)`

Pick a random word of given length in Z_{field_size}.

### `random_combination(words)`

A random linear combination of the given words (from the field `Z_p`), i.e. `a_0*w_0 + a_1*w_1 + ... + a_n*w_n` where the `a_i` are elements of the field `Z_p`.

### `set_generated_by(basis)`

Returns the set of codewords generated by the given list of basis codewords.

### `is_generated_by(basis,words)`

Can all of the given words be written as a linear combination of the words in `basis`?

### `linearly_independent(basis)`

Are the given codewords linearly independent? (it checks that the set generated by the basis contains `(field_size)^(number of basis words)` words)

### `coset_containing(word,basis)`

Generate the coset containing the given word, with respect to the given generating set.

### `slepian_array(basis)`

Generate the Slepian array corresponding to the given basis set. Each row in the result is a coset, sorted by weight.

### `is_coset_leader(word,basis)`

Is the given word a coset leader in its coset? That is, does it have the minimum weight?

### `generator_matrix(words)`

A minimal set of generators for the linear code generated by the given words. If the words are linearly independent, you'll get the same number of words back, otherwise you'll get fewer.

### `parity_check_matrix(basis)`

Create a parity check matrix for the given generating set, by putting it in reduced row-echelon form `I_n|A` and returning `-A_transpose|I_(m)`.

### `lexicographic_parity_check_matrix(words)`

Create a parity check matrix for the given generating set, with columns in lexicographic order.

### `hamming_parity_check_matrix(p,r)`

Create a parity check matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)

### `hamming_generating_matrix(p,r)`

Create a generating matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)

### `syndrome(word,pcm)`

Compute the syndrome of the given word with respect to the given parity check matrix.

### `reduced_row_echelon_form(basis)`

Put the given list of words (interpreted as a matrix) into reduced row-echelon form.

### `codeword_matrix(words)`

Returns a matrix whose rows are the given codewords.

### `hamming_square_encode(word)`

Encode `word` using Hamming's square code.

### `hamming_square_decode(word)`

Decode (and correct up to one error in) `word` using Hamming's square code.

### `hamming_encode(word)`

Encode `word` using the general Hamming code.

### `hamming_decode(word)`

Decode (and correct up to one error in) `word` using the general Hamming code.

### `hamming_distance(word1,word2)`

Hamming distance between two codewords.

### `hamming_ball(word,radius)`

All words within given Hamming distance of the given codeword.

### `hamming_sphere(word,radius)`

All words at given Hamming distance from the given codeword.

### `concat([words])`

Concatenate a list of codewords into one codeword.

### `len(word)`

Length of a codeword.

### `error(word,position)`

Introduce an error (change a digit) at the given position. Returns a new codeword.

### `check_array(word)`

Returns a LaTeX check-array for the given word, from a Hamming square code.

### `string(word)`

String representation of a codeword.

### `latex(word)`

LaTeX representation of a codeword.

### `code([words])`

Create a code from a complete set of codewords.

### `allwords(code)`

All words belonging to the given code.

### `minimum_distance(code)`

Minimum Hamming distance between words in code.

### `information_rate(code)`

A code's information rate

### `len(code)`

Number of words in code.

### `code[n]`

nth word in code. (in the order used when you created the code object)

### `code[m..n]`

List of the mth to nth words in code.

### `positional_permutation(code,positions)`

Permute the positions of the digits in code's words, following the given order.

### `symbolic_permutation(code,symbols)`

Permute the symbols in code's words, following the given order. `symbols` is a list giving a permutation for each digit. That is, `symbols[i][j]` says what symbol `j` should change to when in position `i`.

### `equivalent(code1,code2)`

Can code2 be obtained from code1 by a combination of positional and symbolic permutations?

### `hamming_bound(field_size,word_length,errors_corrected)`

Hamming bound on the maximum number of codewords in a code with the given parameters.

### `singleton_bound(field_size,word_length,minimum_distance)`

Singleton bound on the maximum number of codewords in a code with the given parameters.

### `gilbert_varshamov_bound(field_size,word_length,minimum_distance)`

Gilbert-Varshamov bound on the minimum number of codewords in a code with the given parameters.

JavaScript functions
--------------------

Everything lives under `Numbas.extensions.codewords`, which I'll omit from now on.

### `Codeword(digits,field_size)`

Create a codeword with the given digits, belonging to the field `Z_{field_size}`.

#### `Codeword` methods

##### `word.toString()`

String representation of the word.

##### `word.toLaTeX()`

LaTeX representation of the word.

##### `word.toJME()`

JME representation of the word.

##### `word.isZero()`

Is the word zero (are all its digits 0)?

##### `word.eq(word2)`

Is this word the same as `word2`?

##### `word.add(word2)`

Return a new word which is the sum of this word and `word2`.

##### `word.sub(word2)`

Subtract `word2` from this word (returns a new codeword object).

##### `word.negate()`

Negate this word: `w.add(w.negate()) = 0`.

##### `word.scale(n)`

Scale this word by `n` - multiply every digit by `n`.

##### `word.weight()`

Hamming weight of this word - number of non-zero digits.

##### `word.LaTeX_check_array()`

LaTeX rendering of a Hamming square code check array for this word (only makes sense if this word is a 9-digit binary word)

##### `word.hamming_ball(radius)`

Find all words within `radius` Hamming distance of this word.

##### `word.hamming_sphere(radius)`

Find all words with Hamming distance exactly `radius` from this word.

#### Static methods of the `Codeword` class

##### `fromString(str,field_size)`

Create a codeword object from a string representation, e.g. `Codeword.fromString("01001",2)`.

##### `sort(w1,w2)`

Comparison function to sort codewords lexicographically.

##### `eq(w1,w2)`

Equivalent to `w1.eq(w2)`.

### `zero_word(word_length,field_size)`

Create a zero word with the given length in the field `Z_{field_size}`.

### `allwords(word_length,field_size)`

Get all words of the given length in the field `Z_{field_size}`.

### `random_word(word_length,field_size)`

Get a random word of the given length in the field `Z_{field_size}`.

### `random_combination(basis)`

A random linear combination of the given words (from the field `Z_p`), i.e. `a_0*w_0 + a_1*w_1 + ... + a_n*w_n` where the `a_i` are elements of the field `Z_p`.

### `set_generated_by(words)`

Get all words generated by the given basis set.

### `is_generated_by(basis,words)`

Can all of the given words be written as a linear combination of the words in `basis`?

### `linearly_independent(words)`

Are all of the given words linearly independent of each other?

Words are linearly independent if `l1*w1 + l2*w2 + .. +ln*wn = 0` has no solution other than `l1=l2=...=ln=0`.

### `coset_containing(word,basis)`

Generate the coset containing the given word, with respect to the given generating set.

### `slepian_array(basis)`

Generate the Slepian array corresponding to the given basis set. Each row in the result is a coset, sorted by weight.

### `is_coset_leader(word,basis)`

Is the given word a coset leader in its coset? That is, does it have the minimum weight?

### `hamming_distance(word1,word2)`

Hamming distance between two words.

### `reduced_row_echelon_form(basis)`

Put the given list of words (interpreted as a matrix) into reduced row-echelon form by reordering and taking linear combinations.

### `generator_matrix(words)`

A minimal set of generators for the linear code generated by the given words. If the words are linearly independent, you'll get the same number of words back, otherwise you'll get fewer.

### `parity_check_matrix(basis)`

A parity check matrix for the given generating set (which should be linearly independent)

### `lexicographic_parity_check_matrix(basis)`

A parity check matrix for the given generating set, with columns in lexicographic order.

### `hamming_square_encode(word)`

Encode `word` using Hamming's square code.

### `hamming_square_decode(word)`

Decode (and correct up to one error in) `word` using Hamming's square code.

### `hamming_encode(word)`

Encode `word` using the general Hamming code.

### `hamming_decode(word)`

Decode (and correct up to one error in) `word` using the general Hamming code.

### `syndrome(word,pcm)`

Compute the syndrome of the given word with respect to the given parity check matrix.

### `hamming_parity_check_matrix(p,r)`

Create a parity check matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)

### `hamming_generating_matrix(p,r)`

Create a generating matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)

`Ham_p(r)` is the `p`-ary Hamming code whose PCM has `r` rows

### `Code(words)`

A wrapper object for the code containing the given words.

#### `Code` methods

##### `code.toString()`

String representation of the code - list all its words.

##### `code.toLaTeX()`

LaTeX representation of the code.

##### `code.toJME()`

JME representation of the code.

##### `code.eq(code2)`

Is this code the same as `code2`? True if they have exactly the same words.

##### `code.contains(word)`

Does this code contain `word`?

##### `code.find_equivalence(code2)`

If this code is equivalent to `code2`, return an object `{positional_permutation, symbolic_permutation}`. If not, return `null`.

Two codes are equivalent if we can get from one to the other by a combination of positional and symbolic permutations.

##### `code.equivalent(code2)`

Is this code equivalent to `code2` - can you get from one to the other by performing positional and symbolic permutations on the digits of the codewords?

##### `code.minimum_distance()`

The minimum Hamming distance between any pair of words in this code.

##### `code.information_rate()`

Information rate of the code: `log(number of words)/(log(2)*word length)`

##### `code.positional_permutation(order)`

Perform a positional permutation on the words in the code. `order` is a list, where column `i` is sent to `order[i]`. Returns a new `Code` object.

##### `code.symbolic permutation(symbols)`

Perform a symbolic permutation on the words in the code. `symbols` is a list of permutations for each digit, where symbol `j` in position `i` is changed to `symbols[i][j]`. Returns a new `Code` object.

### `hamming_bound(field_size,word_length,errors_corrected)`

Hamming bound on the maximum number of codewords in a code with the given parameters.

### `singleton_bound(field_size,word_length,minimum_distance)`

Singleton bound on the maximum number of codewords in a code with the given parameters.

### `gilbert_varshamov_bound(field_size,word_length,minimum_distance)`

Gilbert-Varshamov bound on the minimum number of codewords in a code with the given parameters.

Marking functions
-----------------

### `mark_codeword_set(part,field_size,fn)`

To be used on a "match text pattern" part, where the student's answer is a list of codewords separated by commas.

Checks that the student's answer is valid, and parses it to a list of `Codeword` objects in the given field, then calls `fn(words)`. In `fn`, `this` refers to the given `part` object.

### `validate_codeword_set(part)`

Validate a part marked by the above function. Shows a warning message if the student's answer can't be interpreted as a list of codewords separated by commas.
