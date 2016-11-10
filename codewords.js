Numbas.addExtension('codewords',['math','jme','jme-display'],function(codewords) {

	function set(arr,sort,eq) {
	  return arr.slice().sort(sort).reduce(function(arr,b){
		if(!arr.length || (eq ? !eq(arr[arr.length-1],b) : arr[arr.length-1]!=b)){
		  arr.push(b);
		}
		return arr;
	  },[]);
	}

	function keysort(key) {
		if(typeof(key)=='string') {
			return function(a,b) {
				return a[key]>b[key] ? 1 : a[key]<b[key] ? -1 : 0;
			}
		} else {
			return function(a,b) {
				a = key(a);
				b = key(b);
				return a>b ? 1 : a<b ? -1 : 0;
			}
		}
	}

    /** Create a codeword with the given digits, belonging to the field `Z_{field_size}`.
     * @constructor
     * @memberof codewords
     * @property {number} field_size
     * @property {number[]} digits
     * @property {number} length
     * @property {string} asString
     *
     * @param {number[]} digits
     * @param {number} field_size
     */

	var Codeword = codewords.Codeword = function(digits,field_size) {
		this.field_size = field_size || 2;
		this.digits = digits || [];
		this.length = this.digits.length;
		this.asString = this.digits.join('');
	}
	Codeword.prototype = {
        /** String representation of the word.
         * @returns {string}
         */
		toString: function() {
			return this.asString;
		},
        /** LaTeX representation of the word.
         * @returns {string}
         */
		toLaTeX: function() {
			return '\\mathtt{'+this.asString+'}';
		},
        /** JME representation of the word.
         * @returns {string}
         */
		toJME: function() {
			return 'codeword("'+this.asString+'",'+this.field_size+')';
		},
        /** Is the word zero (are all its digits 0)?
         * @returns {boolean}
         */
		isZero: function() {
			for(var i=0;i<this.length;i++) {
				if(this.digits[i]!==0) {
					return false;
				}
			}
			return true;
		},
        /** Is this word the same as `word2`?
         * @returns {boolean}
         */
		eq: function(b) {
			var a = this; 
			return a.field_size==b.field_size && a.length==b.length && a+''==b+''; 
		},
        /** Return a new word which is the sum of this word and `word2`.
         * @param {codewords.Codeword} w2
         * @returns {codewords.Codeword}
         */
		add: function(w2) {
			var field_size = this.field_size;
			var digits = this.digits.map(function(d1,i) {
				return (d1+w2.digits[i]) % field_size;
			});
			return new Codeword(digits,field_size);
		},
        /** Subtract `word2` from this word (returns a new codeword object).
         * @param {codewords.Codeword} w2
         * @returns {codewords.Codeword}
         */
		sub: function(w2) {
			var field_size = this.field_size;
			var digits = this.digits.map(function(d1,i) {
				var r = (d1-w2.digits[i]) % field_size;
				if(r<0) {
					r += field_size;
				}
				return r;
			});
			return new Codeword(digits,field_size);
		},
        /** Negate this word: `w.add(w.negate()) = 0`.
         * @returns {codewords.Codeword}
         */
		negate: function() {
			var field_size = this.field_size;
			var digits = this.digits.map(function(d) {
				return (field_size - d) % field_size;
			});
			return new Codeword(digits,field_size);
		},
        /** Scale this word by `n` - multiply every digit by `n`.
         * @param {number} n
         * @returns {codewords.Codeword}
         */
		scale: function(n) {
			var field_size = this.field_size;
			n = n % field_size;
			if(n<0) {
				n += field_size;
			}
			var digits = this.digits.map(function(d) {
				return (n*d)%field_size;
			});
			return new Codeword(digits,this.field_size);
		},
        /** Hamming weight of this word - number of non-zero digits.
         * @returns {number}
         */
		weight: function() {
			return this.digits.reduce(function(a,b){return a+(b>0?1:0)},0);
		},

        /** LaTeX rendering of a Hamming square code check array for this word (only makes sense if this word is a 9-digit binary word)
         * @returns {string}
         */
		LaTeX_check_array: function() {
			var n = Math.sqrt(this.length);

			var out = '\\begin{array}{';
			for(var i=0;i<n-1;i++) {
				out += 'c';
			}
			out += '|c}\n';

			for(var i=0;i<n-1;i++) {
				out+=this.digits.slice(i*n,(i+1)*n).join(' & ')+' \\\\\n';
			}
			out += '\\hline\n';
			out += this.digits.slice((n-1)*n).join(' & ')+'\n';

			out += '\\end{array}';

			return out;
		},

        /** Find all words within `radius` Hamming distance of this word.
         * @param {number} radius
         * @returns {codewords.Codeword[]}
         */
		hamming_ball: function(radius) {
			var field_size = this.field_size;
			function ball(digits,radius) {
				if(radius==0) {
					return [digits.slice()];
				}
				if(digits.length==1) {
					var o = [];
					for(var i=0;i<field_size;i++) {
						o.push([i]);
					}
					return o;
				}
				var out = [];
				// for each choice of the first digit
				for(var i=0;i<field_size;i++) {
					var next_digits = ball(digits.slice(1),i==digits[0] ? radius : radius-1);
					out = out.concat(next_digits.map(function(d) {
						d.splice(0,0,i);
						return d;
					}));
				}
				return out;
			}

			return ball(this.digits,radius).map(function(digits){ return new Codeword(digits,field_size) });
		},

        /** Find all words with Hamming distance exactly `radius` from this word.
         * @param {number} radius
         * @returns {codewords.Codeword[]}
         */
		hamming_sphere: function(radius) {
			var field_size = this.field_size;
			function ball(digits,radius) {
				if(radius==0) {
					return [digits.slice()];
				}
				if(digits.length==1) {
					if(radius==1) {
						var o = [];
						for(var i=0;i<field_size;i++) {
							if(i!=digits[0]) {
								o.push([i]);
							}
						}
						return o;
					} else {
						return [];
					}
				}
				var out = [];
				// for each choice of the first digit
				for(var i=0;i<field_size;i++) {
					var next_digits = ball(digits.slice(1),i==digits[0] ? radius : radius-1);
					out = out.concat(next_digits.map(function(d) {
						d.splice(0,0,i);
						return d;
					}));
				}
				return out;
			}

			return ball(this.digits,radius).map(function(digits){ return new Codeword(digits,field_size) });
		}
	}

    /** Create a codeword object from a string representation, e.g. `Codeword.fromString("01001",2)`.
     * @param {string} w
     * @param {number} field_size
     * @returns {codewords.Codeword}
     */
	Codeword.fromString = function(w,field_size) {
		w = w || '';
		var digits = w.split('').map(function(d){ return parseInt(d) });
		return new Codeword(digits,field_size);
	}
    /** Comparison function to sort codewords lexicographically.
     * @param {codeword.Codeword} a
     * @param {codeword.Codeword} b
     * @returns {number}
     */
	Codeword.sort = function(a,b){
		a = a+'';
		b = b+'';
		return a>b ? 1 : a<b ? -1 : 0 
	};
    /** Equivalent to `w1.eq(w2)`.
     * @param {codeword.Codeword} a
     * @param {codeword.Codeword} b
     * @returns {number}
     */
	Codeword.eq = function(a,b) { return a.eq(b); }

	var sort_by_weight = keysort(function(w){return w.weight()});

    /** Create a zero word with the given length in the field `Z_{field_size}`.
     * @param {number} word_length
     * @param {number} field_size
     * @returns {codewords.Codeword}
     */
	var zero_word = codewords.zero_word = function(word_length,field_size) {
		var digits = [];
		for(var i=0;i<word_length;i++) {
			digits.push(0);
		}
		return new Codeword(digits,field_size);
	}

    /** Get all words of the given length in the field `Z_{field_size}`.
     * @param {number} word_length
     * @param {number} field_size
     * @returns {codewords.Codeword[]}
     */
	var allwords = codewords.allwords = function(word_length,field_size) {
		var l = [''];
		for(var i=0;i<word_length;i++) {
			var nl = [];
			l.map(function(w) {
				for(var j=0;j<field_size;j++) {
					nl.push(j+''+w);
				}
			});
			l = nl;
		}
		return l.map(function(w){ return Codeword.fromString(w,field_size) });
	}

    /** Get a random word of the given length in the field `Z_{field_size}`.
     * @param {number} word_length
     * @param {number} field_size
     * @returns {codewords.Codeword}
     */
	var random_word = codewords.random_word = function(word_length,field_size) {
		var digits = [];
		for(var i=0;i<word_length;i++) {
			digits.push(Numbas.math.randomint(field_size));
		}
		return new Codeword(digits,field_size);
	}

    /** A random linear combination of the given words (from the field `Z_p`), i.e. `a_0*w_0 + a_1*w_1 + ... + a_n*w_n` where the `a_i` are elements of the field `Z_p`.
     * @param {codewords.Codeword} basis
     * @returns {codewords.Codeword}
     */
	var random_combination = codewords.random_combination = function(basis) {
		var field_size = basis[0].field_size;
		var word_length = basis[0].length;
		var t = zero_word(word_length,field_size);

		for(var i=0;i<basis.length;i++) {
			t = t.add(basis[i].scale(Numbas.math.randomint(field_size)));
		}
		return t;
	}

    /** Get all words generated by the given basis set.
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword[]}
     */
	var set_generated_by = codewords.set_generated_by = function(basis) {
		if(!basis.length) {
			return [];
		}
		var length = basis[0].length;
		var field_size = basis[0].field_size;
		var choices = allwords(basis.length,field_size);
		generated = choices.map(function(choice) {
			var r = zero_word(length,field_size);
			choice.digits.map(function(f,i) {
				r = r.add(basis[i].scale(f));
			});
			return r;
		});
		return set(generated,Codeword.sort,Codeword.eq);
	}

    /** Are all of the given words linearly independent of each other?
     * words are linearly independent if l1w1 + l2w2 + .. +lnwn = 0 has no solution other than l1=l2=...=ln=0
     * @param {codewords.Codeword[]} words
     * @returns {boolean}
     */
	var linearly_independent = codewords.linearly_independent = function(words) {
		var coefficients = [];
		for(var i=0;i<words.length;i++) {
			coefficients.push(0);
		}
		var field_size = words[0].field_size;
		var word_length = words[0].length;
		var num_combinations = Math.pow(field_size,words.length);
		var z = zero_word(word_length,field_size);
		for(var i=1;i<num_combinations;i++) {
			coefficients[0] += 1;
			var j = 0;
			while(coefficients[j]==field_size) {
				coefficients[j] = 0;
				if(j<words.length-1) {
					coefficients[j+1] += 1;
				}
				j+=1;
			}

			var c = z;
			for(var n=0;n<words.length;n++) {
				c = c.add(words[n].scale(coefficients[n]));
			}
			if(c.eq(z)) {
				return false;
			}
		}
		return true;
	}

    /** Generate the coset containing the given word, with respect to the given generating set.
     * @param {codewords.Codeword} word
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword[]}
     */
	var coset_containing = codewords.coset_containing = function(word,basis) {
		var field_size = word.field_size;
		var length = word.length;
		var combs = set_generated_by(basis);
		return combs.map(function(w2) {
			return word.add(w2);
		});
	}

    /** Generate the Slepian array corresponding to the given basis set. Each row in the result is a coset, sorted by weight.
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword[][]}
     */
	var slepian_array = codewords.slepian_array = function(basis) {
		if(!basis.length) {
			return [];
		}
		var field_size = basis[0].field_size;
		var length = basis[0].length;

		var base = set_generated_by(basis);
		var sets = [base];
		var seen = base.map(function(w){return w+''});
		var all = allwords(length,field_size);
		all.sort(function(r1,r2) {
			var a = r1+'';
			var b = r2+'';
			var w1 = r1.weight();
			var w2 = r2.weight();
			return w1>w2 ? 1 : w1<w2 ? -1 : a>b ? 1 : a<b ? -1 : 0;
		})
		all.map(function(w) {
			if(seen.indexOf(w+'')==-1) {
				var cs = coset_containing(w,basis);
				sets.push(cs);
				seen = seen.concat(cs.map(function(w){return w+''}));
			}
		});
		return sets;
	}

    /** Is the given word a coset leader in its coset? That is, does it have the minimum weight?
     * @param {codewords.Codeword} word
     * @param {codewords.Codeword[]} basis
     * @returns {boolean}
     */
	var is_coset_leader = codewords.is_coset_leader = function(word,basis) {
		var coset = coset_containing(word,basis);
		coset.sort(sort_by_weight);
		return word.weight()==coset[0].weight();
	}

    /** Hamming distance between two words.
     * @param {codewords.Codeword} a
     * @param {codewords.Codeword} b
     * @returns {number}
     */
	var hamming_distance = codewords.hamming_distance = function(a,b) {
		if(a.length!=b.length) {
			return;
		}
		var d = 0;
		for(var i=0;i<a.length;i++) {
			if(a.digits[i]!=b.digits[i]) {
				d += 1;
			}
		}
		return d;
	}

	/** swap the ith and jth positions in array a
     * @param {Array} a
     * @param {number} i
     * @param {number} j
     */
	function swap(a,i,j){
		if(i==j) {
			return;
		}
		var x=Math.min(i,j);
		var y=Math.max(i,j); 
		a.splice(y,0,a.splice(x,1,a.splice(y,1)[0])[0]);
	}

    /** Compute the multiplicative inverses of the elements of the field Z_{field_size}
     * @param {number} field_size
     * @returns {number[]}
     */
    function get_inverses(field_size) {
		var inverses = [0,1];
		for(var i=2;i<field_size;i++) {
			for(var j=1;j<field_size;j++) {
				if((i*j)%field_size==1) {
					inverses[i]=j;
					break;
				}
			}
		}
		return inverses;
	}

    /** Put the given list of words (interpreted as a matrix) into reduced row-echelon form by reordering and taking linear combinations.
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword[]}
     */
	var reduced_row_echelon_form = codewords.reduced_row_echelon_form = function(basis) {
		var field_size = basis[0].field_size;
		var matrix = basis.slice();
		var rows = matrix.length;
		var columns = matrix[0].length;

		// calculate inverses in field
		var inverses = [0,1];
		for(var i=2;i<field_size;i++) {
			for(var j=1;j<field_size;j++) {
				if((i*j)%field_size==1) {
					inverses[i]=j;
					break;
				}
			}
		}

		var current_row = 0;
		// for each column, there should be at most one row with a 1 in that column, and every other row should have 0 in that column
		for(var leader_column=0;leader_column<columns;leader_column++) {
			// find the first row with a non-zero in that column
			for(var row=current_row;row<rows;row++) {
				if(matrix[row].digits[leader_column]!=0) {
					break;
				}
			}
			// if we found a row with a non-zero in the leader column 
			if(row<rows) {
				// swap that row with the <leader_column>th one
				if(row!=current_row) {
					var tmp = matrix[row];
					matrix[row] = matrix[current_row];
					matrix[current_row] = tmp;
				}

				// multiply this row so the leader column has a 1 in it
				var inverse = inverses[matrix[current_row].digits[leader_column]];
				matrix[current_row] = matrix[current_row].scale(inverse);

				// subtract multiples of this row from every other row so they all have a 0 in this column
				for(var row=0;row<rows;row++) {
					if(row!=current_row) {
						var original = matrix[row];
						matrix[row] = matrix[row].sub(matrix[current_row].scale(matrix[row].digits[leader_column]));
					}
				}
				current_row += 1;
			}
		}
		
		return matrix;
	}

	/** A minimal set of generators for the linear code generated by the given words. If the words are linearly independent, you'll get the same number of words back, otherwise you'll get fewer.
     * @param {codewords.Codeword[]} words
     * @returns {codewords.Codeword[]}
     */
	var generator_matrix = codewords.generator_matrix = function(words) {
		var matrix = reduced_row_echelon_form(words);
		matrix = matrix.filter(function(w){return !w.isZero()});
		return matrix;
	}

    /** A parity check matrix for the given generating set (which should be linearly independent)
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword[]}
     */
	var parity_check_matrix = codewords.parity_check_matrix = function(basis) {
		var field_size = basis[0].field_size;
		var g = reduced_row_echelon_form(basis);
		var A = g.map(function(c){ return c.digits.slice(g.length)});
		var columns = A[0].length;
		var rows = A.length;
		var m = [];
		for(var i=0;i<columns;i++) {
			var row = [];
			for(var j=0;j<rows;j++) {
				row.push((field_size - A[j][i]) % field_size);
			}
			for(var j=0;j<columns;j++) {
				row.push(j==i ? 1 : 0);
			}
			m.push(new Codeword(row,field_size));
		}
		return m;
	}

    /** A parity check matrix for the given generating set, with columns in lexicographic order.
     * @param {codewords.Codeword[]} basis
     * @returns {codewords.Codeword}
     */
	var lexicographic_parity_check_matrix = codewords.lexicographic_parity_check_matrix = function(basis) {
		var field_size = basis[0].field_size;
		var pcm = parity_check_matrix(basis);

		// transpose the matrix, because we're going to work with columns
		var columns = [];
		for(var i=0;i<basis[0].length;i++) {
			var column = pcm.map(function(row){return row.digits[i];});
			columns.push(new Codeword(column,field_size));
		}

		// ensure the first non-zero digit of each column is 1
		var inverses = get_inverses(field_size);
		columns = columns.map(function(column) {
			for(var i=0;i<column.length;i++) {
				if(column.digits[i]!=0) {
					return column.scale(inverses[column.digits[i]]);
				}
			}
			return column;
		});

		// sort columns lexicographically
		columns.sort(function(c1,c2) {
			var s1 = c1+'';
			var s2 = c2+'';
			return s1>s2 ? 1 : s1<s2 ? -1 : 0;
		});
		
		var rows = [];
		for(var i=0;i<columns[0].length;i++) {
			var row = columns.map(function(column){return column.digits[i];});
			rows.push(new Codeword(row,field_size));
		}
		return rows;
	}

    /** Encode `word` using Hamming's square code.
     * @param {codewords.Codeword} words
     * @returns {codewords.Codeword}
     */
	codewords.hamming_square_encode = function(words) {
		var n = 2;
		var out = [];
		for(var start=0;start<words.length;start+=n*n) {
			var word = words.digits.slice(start,start+n*n);
			var column_sums = [];
			var total = 0;
			for(var i=0;i<n;i++) {
				var row_sum = 0;
				var column_sum = 0;
				for(var j=0;j<n;j++) {
					row_sum += word[n*i+j];
					column_sum += word[n*j+i];
					out.push(word[n*i+j]);
				}
				out.push(row_sum % 2);
				total += row_sum;
				column_sums.push(column_sum % 2);
			}
			out = out.concat(column_sums);
			out.push(total % 2);
		}
		return new Codeword(out,2);
	}

    /** Decode (and correct up to one error in) `word` using Hamming's square code.
     * @param {codewords.Codeword} encoded_word
     * @returns {codewords.Codeword}
     */
	codewords.hamming_square_decode = function(encoded_word) {
		var n = 3;
		var out = [];
		for(var start=0;start<encoded_word.length;start+=n*n) {
			var word = encoded_word.digits.slice(start,start+n*n);

			var row_errors = [];
			var column_errors = [];
			for(var i=0;i<n-1;i++) {
				var row_sum = 0;
				var column_sum = 0;
				for(var j=0;j<n-1;j++) {
					row_sum += word[n*i+j];
					column_sum += word[n*j+i];
				}
				row_errors.push(row_sum % 2 != word[n*i+n-1]);
				column_errors.push(column_sum % 2 != word[n*(n-1)+i]);
			}

			for(var i=0;i<n-1;i++) {
				for(var j=0;j<n-1;j++) {
					var c = word[n*i+j];
					if(row_errors[i] && column_errors[j]) {
						c = 1-c;
					}
					out.push(c);
				}
			}
		}
		return new Codeword(out,2);
	};

	/** integer log_2
     * @param {number} n
     * @returns {number}
     */
	function log2(n) {
		var i = 1;
		var p = 0;
		while(i<=n) {
			i*=2;
			p += 1;
		}
		return p-1;
	}

    /** Encode `word` using the general Hamming code.
     * @param {codewords.Codeword} word
     * @returns {codewords.Codeword}
     */
	codewords.hamming_encode = function(word) {
		var word_length = word.length;
		var pow = Math.ceil(log2(word_length))+1;
		var powers_of_two = [];
		var p = 1;
		var out = [];
		for(var i=0;i<pow;i++) {
			powers_of_two.push(p);
			out[p-1] = 0;
			p *= 2;
		}
		var off = 0;
		for(var i=0;i<word_length;i++) {
			while(i+off==powers_of_two[off]-1) {
				off += 1;
			}
			var j = i+off;
			for(var p=0;p<pow;p++) {
				var power_of_two = powers_of_two[p];
				if((j+1) & power_of_two) {
					out[power_of_two-1] = (out[power_of_two-1] + word.digits[i]) % 2;
				}
			}
			out[j] = word.digits[i];
		}
		return new Codeword(out,2);
	};

    /** Decode (and correct up to one error in) `word` using the general Hamming code.
     * @param {codewords.Codeword} word
     * @returns {codewords.Codeword}
     */
	codewords.hamming_decode = function(word) {
		var word_length = word.length;
		var pow = Math.ceil(log2(word_length));
		var powers_of_two = [];
		var check_digits = [];
		var digits = word.digits.slice();
		var p = 1;
		for(var i=0;i<pow;i++) {
			powers_of_two.push(p);
			check_digits.push(0);
			p *= 2;
		}
		var n = p >> 1;
		var off = 0;
		var out = [];
		for(var i=0;i<word_length;i++) {
			for(var p=0;p<pow;p++) {
				var power_of_two = powers_of_two[p];
				if((i+1) & power_of_two) {
					check_digits[p] = (check_digits[p] + digits[i]) % 2;
				}
			}
		}
		var error = 0;
		for(var i=0;i<pow;i++) {
			if(check_digits[i]) {
				error += powers_of_two[i];
			}
		}
		digits[error-1] = 1 - digits[error-1];
		var off = 0;
		for(var i=0;i<n;i++) {
			while(i+off==powers_of_two[off]-1) {
				off += 1;
			}
			var j = i+off;
			if(j<word_length) {
				out.push(digits[j]);
			}
		}
		return new Codeword(out,2);
	}

    /** Compute the syndrome of the given word with respect to the given parity check matrix.
     * @param {codewords.Codeword} word
     * @param {codewords.Codeword[]} pcm
     * @returns {codewords.Codeword}
     */
	var syndrome = codewords.syndrome = function(word,pcm) {
		var word_length = word.length;
		var field_size = word.field_size;
		var digits = pcm.map(function(row) {
			var t = 0;
			for(var i=0;i<word_length;i++) {
				t += word.digits[i]*row.digits[i];
			}
			return Numbas.math.mod(t,field_size);
		});
		return new Codeword(digits,field_size);
	}

	/** Create a parity check matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)
     * @param {number} p
     * @param {number} r
     * @returns {codewords.Codeword[]}
     */
	var hamming_parity_check_matrix = codewords.hamming_parity_check_matrix = function(p,r) {
		// each column starts with a 1
		// every possible column appears once, and columns are in lexicographic order

		var columns = [];
		var ends = [[]];
		// i is the number of zeros at the start of the column
		for(var i=r-1;i>=0;i--) {

			//each column starts with i zeros followed by a 1
			var start = [];
			for(var j=0;j<i;j++) {
				start.push(0);
			}
			start.push(1);

			// for each possible p-ary string after the 1, make a column
			var i_columns = ends.map(function(digits) {
				return start.concat(digits);
			});
			columns = columns.concat(i_columns);

			if(i>0) {
				// for the next step, compute the possible ends of columns (strings after the first 1)
				// by taking the Cartesian product (0,1,2)x(ends)
				var nends = [];
				for(var j=0;j<p;j++) {
					ends.map(function(end) {
						nends.push([j].concat(end));
					});
				}
				ends = nends;
			}
		}

		var out = [];
		for(var i=0;i<r;i++) {
			var row = columns.map(function(column){return column[i]});
			out.push(new Codeword(row,p));
		}

		return out;
	}

    /** Create a generating matrix for the Hamming code `Ham_p(r)`. (`p` must be prime)
	 * Ham_p(r) is the p-ary Hamming code whose PCM has r rows
     *
     * @param {number} p
     * @param {number} r
     * @returns {codewords.Codeword}
     */
	var hamming_generating_matrix = codewords.hamming_generating_matrix = function(p,r) {
		// Generate the parity-check matrix
		var pcm = hamming_parity_check_matrix(p,r);

		function swap_digits(row) {
			var digits = row.digits.slice();
			var off = 1;
			var t = 1;
			for(var i=1;i<r;i++) {
				var b = digits[i];
				digits[i] = digits[off];
				digits[off] = b;
				t *= p;
				off += t;
			}
			return new Codeword(digits,p);
		}

		// swap the columns so the leftmost columns of the PCM are the identity matrix (backwards, but that doesn't matter)
		var rows = pcm.map(swap_digits);
		// find a generating matrix for the dual code (i.e., the actual Hamming code, but with columns swapped)
		var dual = parity_check_matrix(rows);
		// swap the columns back
		var gen = dual.map(swap_digits);

		return gen;
	}

    /** A wrapper object for the code containing the given words.
     * @constructor
     * @memberof codewords
     * @property {codewords.Codeword[]} words
     * @property {number} length
     * @property {number} word_length
     * @property {number} field_size
     *
     * @param {codewords.Code} words
     */
	var Code = codewords.Code = function(words) {
		this.words = words;
		this.length = this.words.length;
		this.word_length = this.length>0 ? this.words[0].length : 0;
		this.field_size = this.length>0 ? this.words[0].field_size : 0;
	}
	Code.prototype = {
        /** String representation of the code - list all its words.
         * @returns {string}
         */
		toString: function() {
			return '{'+this.words.map(function(word){return word+''}).join(', ')+'}';
		},
        /** LaTeX representation of the code.
         * @returns {string}
         */
		toLaTeX: function() {
			return '\\{'+this.words.map(function(word){return word.toLaTeX()}).join(', ')+'\\}';
		},
        /** JME representation of the code.
         * @returns {string}
         */
		toJME: function() {
			return 'code(['+this.words.map(function(word){return word.toJME()}).join(', ')+'])';
		},

		/** Is this code the same as `code2`? True if they have exactly the same words.
         * @param {codewords.Code} b
         * @returns {boolean}
		 */
		eq: function(b) {
			if(this.length!=b.length || this.field_size!=b.field_size) {
				return false;
			}
			var a_words = this.words.slice();
			var b_words = b.words.slice();
			function compare_words(a,b) {
				a=a.toString();
				b=b.toString(); 
				return a<b ? -1 : a>b ? 1 : 0;
			}
			a_words.sort(compare_words);
			b_words.sort(compare_words);
			for(var i=0;i<this.length;i++) {
				if(!a_words[i].eq(b_words[i])) {
					return false;
				}
			}
			return true;
		},

        /** Does this code contain `word`?
         * @param {codewords.Codeword} word
         * @returns {boolean}
         */
		contains: function(word) {
			for(var i=0;i<this.length;i++) {
				if(this.words[i].eq(word)) {
					return true;
				}
			}
			return false;
		},

		/** If this code is equivalent to `code2`, return an object `{positional_permutation, symbolic_permutation}`. If not, return `null`.
         * Two codes are equivalent if we can get from one to the other by a combination of positional and symbolic permutations.
         * @param {codewords.Code} b
         * @returns {object} {positional_permutation: number[], symbolic_permutation: number[][]}
		 */
        find_equivalence: function(b) {
			if(this.length!=b.length || this.field_size!=b.field_size) {
				return false;
			}
			var positions = [];
			for(var i=0;i<this.word_length;i++) {
				positions.push(i);
			}
			var symbols = [];
			for(var i=0;i<this.field_size;i++) {
				symbols.push(i);
			}
			var positional_permutations = Numbas.util.permutations(positions);
            var l = [];
            for(var i=0;i<this.word_length;i++) {
                l.push(Numbas.util.permutations(symbols));
            }
			var symbolic_permutations = Numbas.util.product(l);

			for(var i=0;i<positional_permutations.length;i++) {
				for(var j=0;j<symbolic_permutations.length;j++) {
					var c = this.positional_permutation(positional_permutations[i]).symbolic_permutation(symbolic_permutations[j]);
					if(c.eq(b)) {
						return {
                            positional_permutation: positional_permutations[i],
                            symbolic_permutation: symbolic_permutations[j]
                        };
					}
				}
			}
			return null;
        },

        /** Is this code equivalent to `code2` - can you get from one to the other by performing positional and symbolic permutations on the digits of the codewords?
         * @see {codewords.Code.find_equivalence}
         * @param {codewords.Code} b
         * @returns {boolean}
         */
		equivalent: function(b) {
            var res = this.find_equivalence(b);
            return res!==null;
		},

        /** The minimum Hamming distance between any pair of words in this code.
         * @returns {number}
         */
		minimum_distance: function() {
			if(this.length==0) {
				return 0;
			}
			var min;
			for(var i=0;i<this.length;i++) {
				for(var j=i+1;j<this.length;j++) {
					var d = hamming_distance(this.words[i],this.words[j]);
					if(min===undefined || d<min) {
						min = d;
					}
				}
			}
			return min;
		},

        /** Information rate of the code: `log(number of words)/(log(2)*word length)`
         * @returns {number}
         */
		information_rate: function() {
			if(this.words.length==0) {
				return 0;
			}
			return Math.log(this.length)/Math.log(2)/this.words[0].length;
		},

        /** Perform a positional permutation on the words in the code. `order` is a list, where column `i` is sent to `order[i]`.
         * @param {number[]} order
         * @returns {codewords.Code}
         */
		positional_permutation: function(order) {
			var words = this.words.map(function(word) {
				var digits = [];
				for(var i=0;i<order.length;i++) {
					digits.push(word.digits[order[i]]);
				}
				return new Codeword(digits,word.field_size);
			});

			return new Code(words,this.field_size);
		},

        /** Perform a symbolic permutation on the words in the code. `symbols` is a list of permutations for each digit, where symbol `j` in position `i` is changed to `symbols[i][j]`.
         * @param {number[][]} symbol_permutations
         * @returns {codewords.Code}
         */
		symbolic_permutation: function(symbol_permutations) {
			var words = this.words.map(function(word) {
				var digits = word.digits.map(function(d,i) {
					return symbol_permutations[i][d];
				});
				return new Codeword(digits,word.field_size);
			});

			return new Code(words,this.field_size);
		}
	};

    /** Hamming bound on the maximum number of codewords in a code with the given parameters.
     * @param {number} field_size
     * @param {number} word_length
     * @param {number} errors_corrected
     * @returns {number}
     */
	codewords.hamming_bound = function(field_size,word_length,errors_corrected) {
		var sum = 0;
		for(var k=0;k<=errors_corrected;k++) {
			sum += Numbas.math.combinations(word_length,k)*Math.pow(field_size-1,k);
		}
		return Math.floor(Math.pow(field_size,word_length)/sum);
	}

    /** Singleton bound on the maximum number of codewords in a code with the given parameters.
     * @param {number} field_size
     * @param {number} word_length
     * @param {number} minimum_distance - the minimum Hamming distance between codewords
     * @returns {number}
     */
	codewords.singleton_bound = function(field_size,word_length,minimum_distance) {
		return Math.pow(field_size,word_length-minimum_distance+1);
	}

    /** Gilbert-Varshamov bound on the minimum number of codewords in a code with the given parameters.
     * @param {number} field_size
     * @param {number} word_length
     * @param {number} minimum_distance - the minimum Hamming distance between codewords
     * @returns {number}
     */
	codewords.gilbert_varshamov_bound = function(field_size,word_length,minimum_distance) {
		var sum = 0;
		for(var i=0;i<minimum_distance;i++) {
			sum += Numbas.math.combinations(word_length,i)*Math.pow(field_size-1,i);
		}
		return Math.ceil(Math.pow(field_size,word_length)/sum);
	}


	/// JME stuff
	if(Numbas.jme) {
	
	var TCodeword = Numbas.jme.types.codeword = Numbas.jme.types.TCodeword= function(codeword) {
		this.value = codeword;
	};
	TCodeword.prototype.type = 'codeword';

	Numbas.jme.display.typeToTeX.codeword = function(thing,tok,texArgs,settings) {
		return tok.value.toLaTeX();
	};

	Numbas.jme.display.typeToJME.codeword = function(tree,tok,bits,settings) {
		return tok.value.toJME();
	}

	Numbas.jme.display.texOps.codeword = function(thing,texArgs,settings) {
		var word = codewords.scope.evaluate(thing);
		return word.value.toLaTeX();
	}

	var TCode = Numbas.jme.types.code = Numbas.jme.types.TCode = function(code) {
		this.value = code;
	}
	TCode.prototype.type = 'code';

	Numbas.jme.display.typeToTeX.code = function(thing,tok,texArgs,settings) {
		return tok.value.toLaTeX();
	};

	Numbas.jme.display.typeToJME.code = function(tree,tok,bits,settings) {
		return tok.value.toJME();
	}

	Numbas.jme.display.texOps.code = function(thing,texArgs,settings) {
		var code = codewords.scope.evaluate(thing);
		return code.value.toLaTeX();
	}


	var funcObj = Numbas.jme.funcObj;
	var TString = Numbas.jme.types.TString;
	var TNum = Numbas.jme.types.TNum;
	var TList = Numbas.jme.types.TList;
	var TBool = Numbas.jme.types.TBool;
	var TMatrix = Numbas.jme.types.TMatrix;
	var TRange = Numbas.jme.types.TRange;
	var TVector = Numbas.jme.types.TVector;

	codewords.scope.addFunction(new funcObj('codeword',[TString,TNum],TCodeword,function(word,field_size) {
		return Codeword.fromString(word,field_size) ;
	}));
	codewords.scope.addFunction(new funcObj('codeword',[TList,TNum],TCodeword,function(digits,field_size) {
		digits = digits.map(function(i){ return i.value; });
		return new Codeword(digits,field_size) ;
	}));
	codewords.scope.addFunction(new funcObj('codeword',[TVector,TNum],TCodeword,function(digits,field_size) {
		return new Codeword(digits,field_size) ;
	}));

	codewords.scope.addFunction(new funcObj('zero',[TNum,TNum],TCodeword,function(word_length,field_size) {
		return zero_word(word_length,field_size);
	}));

	codewords.scope.addFunction(new funcObj('latex',[TCodeword],TString,null, {
		evaluate: function(args,scope) {
			var tex = args[0].value.toLaTeX();
			var s = new TString(tex);
			s.latex = true;
			return s;
		}
	}));
	codewords.scope.addFunction(new funcObj('is_zero',[TCodeword],TBool,function(word) {
		return word.isZero();
	}));

	codewords.scope.addFunction(new funcObj('+',[TCodeword,TCodeword],TCodeword,function(w1,w2) {
		return w1.add(w2);
	}));
	codewords.scope.addFunction(new funcObj('-',[TCodeword,TCodeword],TCodeword,function(w1,w2) {
		return w1.sub(w2);
	}));
	codewords.scope.addFunction(new funcObj('+u',[TCodeword],TCodeword,function(w) {
		return w;
	}));
	codewords.scope.addFunction(new funcObj('-u',[TCodeword],TCodeword,function(w) {
		return w.negate();
	}));

	codewords.scope.addFunction(new funcObj('*',[TCodeword,TNum],TCodeword,function(w,f) {
		return w1.scale(f);
	}));

	codewords.scope.addFunction(new funcObj('*',[TNum,TCodeword],TCodeword,function(w,f) {
		return w1.scale(f);
	}));

	codewords.scope.addFunction(new funcObj('listval',[TCodeword,TNum],TNum,function(w,i) {
		return w.digits[i];
	}));
	codewords.scope.addFunction(new funcObj('listval',[TCodeword,TRange],TList,function(w,range) {
		return w.digits.slice(range[0],range[1]).map(function(d){return new TNum(d)});
	}));

	codewords.scope.addFunction(new funcObj('weight',[TCodeword],TNum,function(w) {
		return w.weight();
	}));

	codewords.scope.addFunction(new funcObj('allwords',[TNum,TNum],TList,function(n,field_size) {
		var words = codewords.allwords(n,field_size).map(function(c){return new TCodeword(c)});
		return words;
	}));

	codewords.scope.addFunction(new funcObj('random_word',[TNum,TNum],TCodeword,function(n,field_size) {
		return random_word(n,field_size);
	}));

	codewords.scope.addFunction(new funcObj('random_combination',[TList],TCodeword,function(basis) {
		return random_combination(basis);
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('set_generated_by',[TList],TList,function(basis) {
		return codewords.set_generated_by(basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('linearly_independent',[TList],TBool,function(words) {
		return codewords.linearly_independent(words);
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('coset_containing',[TCodeword,TList],TList,function(word,basis) {
		return codewords.coset_containing(word,basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('slepian_array',[TList],TList,function(basis) {
		var slepian = codewords.slepian_array(basis).map(function(row){return row.map(function(c){return new TCodeword(c)})});
		return slepian;
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('is_coset_leader',[TCodeword,TList],TBool,function(word,basis) {
		return codewords.is_coset_leader(word,basis);
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('generator_matrix',[TList],TList,function(basis) {
		return codewords.generator_matrix(basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('parity_check_matrix',[TList],TList,function(basis) {
		return codewords.parity_check_matrix(basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('lexicographic_parity_check_matrix',[TList],TList,function(basis) {
		return codewords.lexicographic_parity_check_matrix(basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('hamming_parity_check_matrix',[TNum,TNum],TList,function(p,r) {
		return codewords.hamming_parity_check_matrix(p,r).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('hamming_generating_matrix',[TNum,TNum],TList,function(p,r) {
		return codewords.hamming_generating_matrix(p,r).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('syndrome',[TCodeword,TList],TCodeword,function(word,pcm) {
		pcm = pcm.map(function(i){ return i.value; });
		return codewords.syndrome(word,pcm);
	}));

	codewords.scope.addFunction(new funcObj('reduced_row_echelon_form',[TList],TList,function(basis) {
		return codewords.reduced_row_echelon_form(basis).map(function(c){return new TCodeword(c)});
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('codeword_matrix',[TList],TMatrix,function(words) {
		var matrix = words.map(function(w){return w.digits});
		matrix.rows = words.length;
		matrix.columns = matrix[0].length;
		return new TMatrix(matrix);
	},{unwrapValues: true}));

	codewords.scope.addFunction(new funcObj('hamming_square_encode',[TCodeword],TCodeword,function(word) {
		return codewords.hamming_square_encode(word);
	}));

	codewords.scope.addFunction(new funcObj('hamming_square_decode',[TCodeword],TCodeword,function(word) {
		return codewords.hamming_square_decode(word);
	}));

	codewords.scope.addFunction(new funcObj('hamming_encode',[TCodeword],TCodeword,function(word) {
		return codewords.hamming_encode(word);
	}));

	codewords.scope.addFunction(new funcObj('hamming_decode',[TCodeword],TCodeword,function(word) {
		return codewords.hamming_decode(word);
	}));

	codewords.scope.addFunction(new funcObj('hamming_distance',[TCodeword,TCodeword],TNum,function(a,b) {
		return hamming_distance(a,b);
	}));

	codewords.scope.addFunction(new funcObj('hamming_ball',[TCodeword,TNum],TList,function(base_word,radius) {
		var words = base_word.hamming_ball(radius);
		return words.map(function(word){ return new TCodeword(word); });
	}));

	codewords.scope.addFunction(new funcObj('hamming_sphere',[TCodeword,TNum],TList,function(base_word,radius) {
		var words = base_word.hamming_sphere(radius);
		return words.map(function(word){ return new TCodeword(word); });
	}));

	codewords.scope.addFunction(new funcObj('concat',[TList],TCodeword,function(words) {
		var digits = [];
		var field_size = 2;
		words.map(function(word) {
			digits = digits.concat(word.value.digits);
			field_size = Math.max(field_size,word.value.field_size);
		});
		return new Codeword(digits,field_size);
	}));

	// 'len' is a synonym for 'abs' and makes more sense, semantically
	codewords.scope.addFunction(new funcObj('abs',[TCodeword],TNum,function(word) {
		return word.length;
	}));

	codewords.scope.addFunction(new funcObj('error',[TCodeword,TNum],TCodeword,function(word,digit) {
		var digits = word.digits.slice();
		var d = Numbas.math.randomint(word.field_size-1);
		if(d>=digits[digit]) {
			d += 1;
		}
		digits[digit] = d;
		return new Codeword(digits,word.field_size);
	}));

	codewords.scope.addFunction(new funcObj('check_array',[TCodeword],TString,function(word) {
		return word.LaTeX_check_array();
	}));

	codewords.scope.addFunction(new funcObj('string',[TCodeword],TString,function(word) {
		return word.toString();
	}));

	codewords.scope.addFunction(new funcObj('latex',[TCodeword],TString,function(word) {
		return word.toLaTeX();
	},{latex:true}));

	codewords.scope.addFunction(new funcObj('code',[TList],TCode,function(words) {
		return new Code(words.map(function(tword){return tword.value}));
	}));

	codewords.scope.addFunction(new funcObj('allwords',[TCode],TList,function(code) {
		return code.words.map(function(w){return new TCodeword(w)});
	}));

	codewords.scope.addFunction(new funcObj('minimum_distance',[TCode],TNum,function(code) {
		return code.minimum_distance();
	}));

	codewords.scope.addFunction(new funcObj('information_rate',[TCode],TNum,function(code) {
		return code.information_rate();
	}));

	codewords.scope.addFunction(new funcObj('abs',[TCode],TNum,function(code) {
		return code.length;
	}));

	codewords.scope.addFunction(new funcObj('listval',[TCode,TNum],TCodeword,function(code,i) {
		return code.words[i];
	}));
	codewords.scope.addFunction(new funcObj('listval',[TCode,TRange],TList,function(code,range) {
		return code.words.slice(range[0],range[1]).map(function(w){return new TCodeword(w)});
	}));

	codewords.scope.addFunction(new funcObj('positional_permutation',[TCode,TList],TCode,function(code,order) {
		return code.positional_permutation(order);
	},{unwrapValues:true}));

	codewords.scope.addFunction(new funcObj('symbolic_permutation',[TCode,TList],TCode,function(code,order) {
		return code.symbolic_permutation(order);
	},{unwrapValues:true}));

	codewords.scope.addFunction(new funcObj('equivalent',[TCode,TCode],TBool,function(a,b) {
		return a.equivalent(b);
	}));

	codewords.scope.addFunction(new funcObj('hamming_bound',[TNum,TNum,TNum],TNum,codewords.hamming_bound));

	codewords.scope.addFunction(new funcObj('singleton_bound',[TNum,TNum,TNum],TNum,codewords.singleton_bound));

	codewords.scope.addFunction(new funcObj('gilbert_varshamov_bound',[TNum,TNum,TNum],TNum,codewords.gilbert_varshamov_bound));

	}

	Numbas.util.equalityTests.codeword = function(a,b) {
		return a.value.eq(b.value);
	}

	Numbas.util.equalityTests.code = function(a,b) {
		return a.value.eq(b.value);
	}


	/** Marking scripts **/

	/** To be used on a "match text pattern" part, where the student's answer is a list of codewords separated by commas. 
     * Mark a list of codewords - check the answer syntax, then pass on a list of parsed codewords to the given function
	 * @param {Numbas.Part} part
	 * @param {number} field_size
	 * @param {function} fn - marking logic, passed a list of codewords, and `this` is the part object
	*/
	codewords.mark_codeword_set = function(part,field_size,fn) {
	  var re_answer = /^\s*\d+(\s*,\s*\d+)*\s*$/;
	  
	  part.correct_format = re_answer.test(part.studentAnswer);
	  if(!part.correct_format) {
		part.setCredit(0,"Your answer is not a list of codewords.");
		return;
	  }
		
	  var bits = part.studentAnswer.trim().split(/\s*,\s*/);
	  var words = bits.map(function(bit) {
		return Codeword.fromString(bit,field_size);
	  });
	  
	  fn.apply(part,[words]);
	}

    /** Validate a part where the student's answer is a list of codewords separated by commas.
     * @see codewords.mark_codeword_set
     * @param {Numbas.Part} part
     * @returns {boolean}
     */
	codewords.validate_codeword_set = function(part) {
		if(!part.correct_format) {
			part.giveWarning('You have not written a valid answer. Your answer should be a list of codewords separated by commas.');
			return false;
		}
		return true;
	}

	///////// demo

	/*
	var words = allwords(5,3);
	console.log(words.join(','));

	var basis = [words[1],words[3],words[5]];
	console.log('basis:',basis.join(','));
	var combs = set_generated_by(basis);
	console.log('set generated: ',combs.join(','));
	console.log('linearly independent? ',linearly_independent([words[1],words[3]]));

	var w = Codeword.fromString('00110',3);
	var c = coset_containing(w,basis);
	console.log('coset generated by '+w+': '+c.join(','));
	console.log('is coset leader? '+is_coset_leader(w,basis));

	var slepian = slepian_array(basis);
	console.log('slepian array');
	console.log(slepian.map(function(cs){return cs.join(',');}).join('\n'));

	var a = scope.evaluate('code(shuffle(allwords(4,2))[0..3])').value;
	var b = a.positional_permutation(Numbas.math.deal(4)).symbolic_permutation(Numbas.math.deal(2));
	console.log('a '+a);
	console.log('b '+b);
	console.log(a.equivalent(b));
	*/
});
