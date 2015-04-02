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

	var Codeword = codewords.Codeword = function(digits,field_size) {
		this.field_size = field_size || 2;
		this.digits = digits || [];
		this.length = this.digits.length;
		this.asString = this.digits.join('');
	}
	Codeword.prototype = {
		toString: function() {
			return this.asString;
		},
		toLaTeX: function() {
			return '\\mathtt{'+this.asString+'}';
		},
		toJME: function() {
			return 'codeword("'+this.asString+'",'+this.field_size+')';
		},
		isZero: function() {
			for(var i=0;i<this.length;i++) {
				if(this.digits[i]!==0) {
					return false;
				}
			}
			return true;
		},
		eq: function(b) {
			var a = this; 
			return a.field_size==b.field_size && a.length==b.length && a+''==b+''; 
		},
		add: function(w2) {
			var field_size = this.field_size;
			var digits = this.digits.map(function(d1,i) {
				return (d1+w2.digits[i]) % field_size;
			});
			return new Codeword(digits,field_size);
		},
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
		negate: function() {
			var field_size = this.field_size;
			var digits = this.digits.map(function(d) {
				return (field_size - d) % field_size;
			});
			return new Codeword(digits,field_size);
		},
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
		weight: function() {
			return this.digits.reduce(function(a,b){return a+(b>0?1:0)},0);
		},

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

	Codeword.fromString = function(w,field_size) {
		w = w || '';
		var digits = w.split('').map(function(d){ return parseInt(d) });
		return new Codeword(digits,field_size);
	}
	Codeword.sort = function(a,b){
		a = a+'';
		b = b+'';
		return a>b ? 1 : a<b ? -1 : 0 
	};
	Codeword.eq = function(a,b) { return a.eq(b); }

	var sort_by_weight = keysort(function(w){return w.weight()});

	var zero_word = codewords.zero_word = function(n,field_size) {
		var digits = [];
		for(var i=0;i<n;i++) {
			digits.push(0);
		}
		return new Codeword(digits,field_size);
	}

	var allwords = codewords.allwords = function(n,field_size) {
		var l = [''];
		for(var i=0;i<n;i++) {
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

	var random_word = codewords.random_word = function(n,field_size) {
		var digits = [];
		for(var i=0;i<n;i++) {
			digits.push(Numbas.math.randomint(field_size));
		}
		return new Codeword(digits,field_size);
	}

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

	var linearly_independent = codewords.linearly_independent = function(words) {
		// words are linearly independent if l1w1 + l2w2 + .. +lnwn = 0 has no solution other than l1=l2=...=ln=0
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

	var coset_containing = codewords.coset_containing = function(word,basis) {
		var field_size = word.field_size;
		var length = word.length;
		var combs = set_generated_by(basis);
		return combs.map(function(w2) {
			return word.add(w2);
		});
	}

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

	var is_coset_leader = codewords.is_coset_leader = function(word,basis) {
		var coset = coset_containing(word,basis);
		coset.sort(sort_by_weight);
		return word.weight()==coset[0].weight();
	}

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

	// swap the ith and jth positions in array a
	function swap(a,i,j){
		if(i==j) {
			return;
		}
		var x=Math.min(i,j);
		var y=Math.max(i,j); 
		a.splice(y,0,a.splice(x,1,a.splice(y,1)[0])[0]);
	}

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

	var gaussian_elimination = codewords.gaussian_elimination = function(basis) {
		basis.sort(keysort('asString'));
		var field_size = basis[0].field_size;
		var matrix = basis.slice();
		var rows = matrix.length;

		var inverses = get_inverses(field_size);

		for(var c=0;c<rows;c++) {
			// find the first row with a non-zero in column c
			for(var i=c;i<rows;i++) {
				if(matrix[i].digits[c]!=0 && inverses[matrix[i].digits[c]]!==undefined) {
					break;
				}
			}
			if(i==rows) {
				throw(new Error('nothing in column '+row));
			}

			// multiply by the inverse of m_c,c so it has a 1 at that position
			var inv = inverses[matrix[i].digits[c]];
			matrix[i] = matrix[i].scale(inv);

			for(var row=0;row<rows;row++) {
				if(row!=i && matrix[row].digits[c]!=0) {
					matrix[row] = matrix[row].sub(matrix[i].scale(matrix[row].digits[c]));
				}
			}
		}

		return matrix;
	}

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

	/* Generator matrix for the given words */
	var generator_matrix = codewords.generator_matrix = function(words) {
		var matrix = reduced_row_echelon_form(words);
		matrix = matrix.filter(function(w){return !w.isZero()});
		return matrix;
	}

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

	codewords.hamming_square_decode = function(words) {
		var n = 3;
		var out = [];
		for(var start=0;start<words.length;start+=n*n) {
			var word = words.digits.slice(start,start+n*n);

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

	// integer log_2
	function log2(n) {
		var i = 1;
		var p = 0;
		while(i<=n) {
			i*=2;
			p += 1;
		}
		return p-1;
	}

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

	/* pcm is a parity check matrix for the code, given as a list of codewords */
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

	/* Lexicographic parity check matrix for Hamming code Ham_p(r) */
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

	var Code = codewords.Code = function(words) {
		this.words = words;
		this.length = this.words.length;
		this.word_length = this.length>0 ? this.words[0].length : 0;
		this.field_size = this.length>0 ? this.words[0].field_size : 0;
	}
	Code.prototype = {
		toString: function() {
			return '{'+this.words.map(function(word){return word+''}).join(', ')+'}';
		},
		toLaTeX: function() {
			return '\\{'+this.words.map(function(word){return word.toLaTeX()}).join(', ')+'\\}';
		},
		toJME: function() {
			return 'code('+this.words.map(function(word){return word.toJME()}).join(', ')+')';
		},

		/** Do this and b have exactly the same words?
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

		contains: function(w) {
			for(var i=0;i<this.length;i++) {
				if(this.words[i].eq(w)) {
					return true;
				}
			}
			return false;
		},

		/** This is equivalent to b if we can get to b by positional or symbolic permutations
		 */
		equivalent: function(b) {
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
			var symbolic_permutations = Numbas.util.permutations(symbols);

			for(var i=0;i<positional_permutations.length;i++) {
				for(var j=0;j<symbolic_permutations.length;j++) {
					var c = this.positional_permutation(positional_permutations[i]).symbolic_permutation(symbolic_permutations[j]);
					if(c.eq(b)) {
						return true;
					}
				}
			}
			return false;
		},

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

		information_rate: function() {
			if(this.words.length==0) {
				return 0;
			}
			return Math.log(this.length)/Math.log(2)/this.words[0].length;
		},

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

		symbolic_permutation: function(symbols) {
			var words = this.words.map(function(word) {
				var digits = word.digits.map(function(d) {
					return symbols[d];
				});
				return new Codeword(digits,word.field_size);
			});

			return new Code(words,this.field_size);
		}
	};

	codewords.hamming_bound = function(field_size,word_length,errors_corrected) {
		var sum = 0;
		for(var k=0;k<=errors_corrected;k++) {
			sum += Numbas.math.combinations(word_length,k)*Math.pow(field_size-1,k);
		}
		return Math.floor(Math.pow(field_size,word_length)/sum);
	}

	codewords.singleton_bound = function(field_size,word_length,minimum_distance) {
		return Math.pow(field_size,word_length-minimum_distance+1);
	}

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


	/** Marking functions **/
	codewords.mark_codeword_set = function(part,field_size,fn) {
		var re_word = '[0-'+(field_size-1)+']+';
		var re_words = new RegExp('^\\s*'+re_word+'(?:\\s*,\\s*'+re_word+')*$');
		if(!re_words.test(part.studentAnswer)) {
			part.answered = false;
			part.invalid = true;
			part.markingComment("Your answer is not valid.");
		} else {
			part.invalid = false;
			var words = part.studentAnswer.split(/\s*,\s*/);
			words = words.map(function(s) {
				return Codeword.fromString(s.trim(),field_size);
			});
			fn.apply(part,[words]);
		}
	}
	codewords.validate_codeword_set = function(part) {
		if(part.invalid) {
			part.giveWarning('Your answer is not a list of valid codewords separated by commas.');
			return false;
		}
		if(!part.studentAnswer.trim()) {
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
