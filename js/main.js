$(function() {
	
	//set initial search values
    $('#estimated-property-value').val('$400,000');
    $('#down-payment-value').val('$0');
    $('#current-loan-balance-selector').val('$320,000');
    $('#zip-code-value').val('28277');
	
	//set disclosure link
    var disclosureLink = document.URL + '#second-disclosure';
    $('#small-disclosure-link').attr('href', disclosureLink);
	
	//initialize global variables
    var ltConfig = '';
    var lendersGlobal = '';
    var offersGlobal = '';
    var checkedValues = '';
    var purchaseVar = true;
    var maxLoadTries = 3;
    var loadTry = 0;

	//call initial search
    getMortgageOffers();

	//when user calls new search
    $(document).on('click', '#submit-button-offers', function(e) {
        e.preventDefault();
        var numbersAccurate = true;
		
        if (removeCurrency($('#estimated-property-value').val()) < removeCurrency($('#current-loan-balance-selector').val()) && $('#loan-purpose-selector').val() == 1) {
            numbersAccurate = false;
        }
        if (removeCurrency($('#estimated-property-value').val()) <= removeCurrency($('#down-payment-value').val()) && $('#loan-purpose-selector').val() == 2) {
            numbersAccurate = false;
        }
        if (removeCurrency($('#estimated-property-value').val()) >= 1000000 || removeCurrency($('#estimated-property-value').val()) >= 999998 || removeCurrency($('#down-payment-value').val()) >= 999998) {
            numbersAccurate = false;
        }
        if ($('#loan-purpose-selector').val() == 1) {
            if (!$('#estimated-property-value').val() || !$('#current-loan-balance-selector').val() || !$('#zip-code-value').val() || !numbersAccurate) {
                $('#allOfferRows').html('<div id="error-results" style="color:red; font-weight:bold;"><p>Oops. Please fill in all fields correctly and <br/>try again to view quotes.</span></p></div>');
                $('#error-results').show();
                return false;
            }
        } else if ($('#loan-purpose-selector').val() == 2) {
            if (!$('#estimated-property-value').val() || !$('#down-payment-value').val() || !$('#zip-code-value').val() || !numbersAccurate) {
                $('#allOfferRows').html('<div id="error-results" style="color:red; font-weight:bold;"><p>Oops. Please fill in all fields correctly and try again to view quotes.</span></p></div>');
                $('#error-results').show();
                return false;
            }
        }
        $('#allOfferRows').html('<div id="loading-screen"><span>Searching for the lowest rates....</span><br/><img src="images/loading.gif"></div>');
        getMortgageOffers();
        showLessOptions();
    });
	

	//close overlay
    $(document).on('click', '.overlay, #close-button', function(e) {
        $('.overlay, #sampleContainer').fadeOut();
    });

	//fill and open overlay
    $(document).on('click', '.sample-overlay', function(e) {
        e.preventDefault();
        var i = $(this).attr('offerId');
        var rLA = 10;
        rLA = purchaseVar == true ? requestedLoanAmount2(ltConfig.purchase.EstimatedPurchasePrice, ltConfig.purchase.EstimatedDownPayment) : requestedLoanAmount(ltConfig.refinance.RequestedCashoutAmount, ltConfig.refinance.CurrentMortgageBalance, removeCurrency(ltConfig.SecondLienMortgageBalance));
        var currentLender = lenderInfo(offersGlobal[i].LenderId, lendersGlobal);
        $("#overlay-detail").html("<div id='main-details'><div id='overlay-numbers-details'><div class='rates-detail'>" + formatDecimal(offersGlobal[i].RatePercentage) + "<br/><span>Interest Rate</span></div><div class='apr-detail'>" + formatDecimal(offersGlobal[i].APRPercentage) + "<br/><span>APR</span></div><div class='rates-fees-detail'><strong>" + offersGlobal[i].LoanProductName + "<br/><span>" + formatCurrency(offersGlobal[i].TotalMonthlyPayment) + " payment</span> <span>" + formatCurrency(offersGlobal[i].TotalFees) + " in fees</span></strong></div></div><div id='overlay-lender-details'><a href='" + offersGlobal[i].Links[0].Href + "' target='_blank'><img src='" + currentLender.LogoUrl + "'/></a><br/>" + "<span class='lender-name-yellow'>" + currentLender.Name + "</span><br/><span class='lender-phone'>" + formatPhone(offersGlobal[i].TelephoneNumber) + "</span><br/><br/><a href='" + offersGlobal[i].Links[0].Href + "' class='btn-primary' target='_blank'>Contact Lender</a></div></div><div id='lender-contact-info'><table id='more-values-table'><tr><td><span class='details-header'>Loan Profile</span></td><td></td></tr><tr><td>Purpose</td><td>" + loanType(purchaseVar) + "</td></tr><tr><td>Loan Program</td><td>" + offersGlobal[i].LoanProductName + "</td></tr><tr><td>Loan Term</td><td>" + loanTerm(offersGlobal[i].LoanTermMonths) + " Years</td></tr><tr><td>Rate</td><td>" + formatDecimal(offersGlobal[i].RatePercentage) + "</td></tr><tr><td>APR</td><td>" + formatDecimal(offersGlobal[i].APRPercentage) + "</td></tr><tr><td>Lock Period</td><td>" + offersGlobal[i].LockTermDays + " Days</td></tr><tr><td>Home Value</td><td>" + formatCurrency(ltConfig.refinance.EstimatedPropertyValue) + "</td></tr><tr class='refinance-only'><td><span class='forced-indent'>First Mortgage Balance</span></td><td>" + formatCurrency(ltConfig.refinance.CurrentMortgageBalance) + "</td></tr><tr class='refinance-only'><td><span class='forced-indent'>Second Mortgage Balance</span></td><td>" + formatCurrency(0) + "</td></tr><tr class='purchase-only'><td><span class='forced-indent'>Down Payment</span></td><td>" + formatCurrency(ltConfig.purchase.EstimatedDownPayment) + "</td></tr><tr class='refinance-only'><td><span class='forced-indent'>Cash Out Amount</span></td><td>" + formatCurrency(ltConfig.refinance.RequestedCashoutAmount) + "</td></tr><tr><td>Requested Loan Amount</td><td>" + formatCurrency(rLA) + "</td></tr><tr style='height: 39px; vertical-align: bottom;'><td><span class='details-header'>Fees At Closing</span></td><td></td></tr><tr class='black-line-class'><td colspan='2' class='black-line'></td></tr><tr><td>Total Fees*</td><td><span class='details-header'>" + formatCurrency(totalFees(offersGlobal[i].TotalFees, offersGlobal[i].TotalCredits)) + "</span></td></tr><tr><td colspan='2'><span id='third-party'>*Includes origination fee, loan discount fee, lender fees, and lender credit. Other 3rd party fees may apply. </span></td></tr><tr style='height: 39px; vertical-align: bottom;'><td><span class='details-header'>Estimated Monthly Payment</span></td><td></td></tr><tr><td>Principal and Interest</td><td>" + formatCurrency(offersGlobal[i].PIPayment) + "</td></tr><tr><td>Mortgage Insurance (estimated)</td><td>" + formatCurrency(offersGlobal[i].MIPayment) + "</td></tr><tr class='black-line-class'><td colspan='2' class='black-line'></td></tr><tr><td>Monthly Mortgage Payment</td><td><span class='details-header'>" + formatCurrency(offersGlobal[i].TotalMonthlyPayment) + "</span></td></tr></table></div>");
        if (purchaseVar) {
            $('tr.purchase-only').css('display', 'table-row');
            $('tr.refinance-only').css('display', 'none'); //.show() or .hide()
        } else {
            $('tr.purchase-only').css('display', 'none'); //.show() or .hide()
            $('tr.refinance-only').css('display', 'table-row');
        }
        var leftAmt = parseInt(($(window).innerWidth() - $('#sampleContainer').width()) / 2);
        var topAmt = parseInt($(window).scrollTop()) + 30;
        $('#sampleContainer').css({
            'left': leftAmt,
            'top': topAmt
        });
        $('.overlay, #sampleContainer').fadeIn();
    });

	//center container on page
    $(window).resize(function() {
        var leftAmt = parseInt(($(window).innerWidth() - $('#sampleContainer').width()) / 2);
        $('#sampleContainer').css('left', leftAmt);
    });

	//calculate down payment percentage
    $(document).on('keyup', '#down-payment-value, #estimated-property-value', function(e) {
        var housePrice = removeCurrency($('#estimated-property-value').val());
        var downPayment = removeCurrency($('#down-payment-value').val());
        var downPaymentPercent = (downPayment / housePrice) * 100;
        downPaymentPercent = Math.round(downPaymentPercent);
        if (downPaymentPercent >= 0 || downPaymentPercent <= 100) {
            $('#down-payment-calc').html('(' + downPaymentPercent + '%)');
        } else {
            $('#down-payment-calc').html('(%)');
        }
    });

	//select filter types for loan results
    $(document).on('mouseover', '#loan-type-filter', function(e) {
        checkedValues = checkedValues.replace(/,/g, '');
        for (var r = 0, len = checkedValues.length; r < len; r++) {
            $("#loan-type-filter option[value=" + checkedValues[r] + "]").show();
        }
    });

	//filter results according to selected choice
    $(document).on('change', '#loan-type-filter', function(e) {
        $('#error-results').remove();
        var LPnum = $(this).val();
        filterLoanType(LPnum);
        return false;
    });

	//hides unselected loan type results
    function filterLoanType(nmbr) {
        $('#loan-type-filter').val(nmbr);
        if (nmbr == 0) {
            $('.offer-row').show();
            return false;
        }
        nmbr = '.lpID' + nmbr;
        $('.offer-row').hide();
        $(nmbr).closest('div.offer-row').show();

        if ($('.offer-row:visible').length == 0) {
            $('#allOfferRows').append('<div id="error-results"><p>Oops. We have <strong>0</strong> quotes that met your criteria.</p><p><span>Modify your search or try again to view quotes.</span></p></div>');
            $('#error-results').show();
        }
        return false;
    }

	
	//sorts loan type based on filter choice (most relevant, highest rated, etc.)
    $(document).on('change', '#other-type-filter', function(e) {
        $('#error-results').remove();

        // default sort based on the offer.RelevanceSortScore variable provided by lending tree
        if ($(this).val() == 0) {
            offersGlobal.sort(function(a, b) {
                var keyA1 = a.RelevanceSortScore,
                    keyB1 = b.RelevanceSortScore;
                if (keyA1 < keyB1) return 1;
                if (keyA1 > keyB1) return -1;
                return 0;
            });
            loadOffers(offersGlobal);
        }

        // sorts based on lender rating, best to worst 
        if ($(this).val() == 1) {
            var myArray = $('.offer-row');
            myArray.sort(function(e, f) {
                e = parseInt($(e).attr('lenderrating'));
                f = parseInt($(f).attr('lenderrating'));
                if (e < f) {
                    return 1;
                } else if (e > f) {
                    return -1;
                } else {
                    return 0;
                }
            });
            $('#allOfferRows').html(myArray);
        }

        // sorts based on rate from lowest to highest
        if ($(this).val() == 2) {
            offersGlobal.sort(function(a, b) {
                var keyA = a.RatePercentage,
                    keyB = b.RatePercentage;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            loadOffers(offersGlobal);
        }

        // sorts based on lender name alphabetically
        if ($(this).val() == 3) {
            var myArray = $('.offer-row');
            myArray.sort(function(g, h) {
                g = $(g).attr('lendername');
                h = $(h).attr('lendername');
                if (g > h) {
                    return 1;
                } else if (g < h) {
                    return -1;
                } else {
                    return 0;
                }
            });
            $('#allOfferRows').html(myArray);
        }

        // sorts based on APR percentage lowest to highest
        if ($(this).val() == 4) {
            offersGlobal.sort(function(a, b) {
                var keyA2 = a.APRPercentage,
                    keyB2 = b.APRPercentage;
                if (keyA2 < keyB2) return -1;
                if (keyA2 > keyB2) return 1;
                return 0;
            });
            loadOffers(offersGlobal);
        }
		
		//set filter value
        filterLoanType($('#loan-type-filter').val());
        $('#other-type-filter').val($(this).val());
    });


	//change between purchase and refinance loan options
    $(document).on('change', '#loan-purpose-selector', function(e) {
        if ($(this).val() == 1) {
            purchaseVar = false;
            $('.purchase-only').css('display', 'none'); //.show() or .hide()
            $('.refinance-only').css('display', 'block'); //.show() or .hide()
        } else {
            purchaseVar = true;
            $('.purchase-only').css('display', 'block'); //.show() or .hide()
            $('.refinance-only').css('display', 'none'); //.show() or .hide()
        }
    });

	//formats numbers into dollar values
    $(document).on('blur', '.needs-formatting', function(e) {
        var formatted = formatCurrency($(this).val());
        $(this).val(formatted);
        return false;
    });

	//grab text from input
    $("input[type='text']").on("click", function() {
        $(this).select();
    });


    $(document).on('keypress', '.needs-formatting', function(e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });

	//show less options for search 
    $(document).on('click', '#select-less-options', function(e) {
        e.preventDefault();
        showLessOptions();
    });

	//hide more search terms
    function showLessOptions() {
        $('.loan-options-select a, .extra-container').removeClass('show-more-options hide-more-options');
        $('#loan-options-container').removeClass('expand-loan-container');
        $('.extra-container').addClass('hide-more-options');
        $('#select-more-options').addClass('show-more-options');
        $('#loan-options-container').addClass('compress-loan-container');
        return false;
    }

	//show more search options
    $(document).on('click', '#select-more-options', function(e) {
        e.preventDefault();
        $('.loan-options-select a, .extra-container').removeClass('hide-more-options show-more-options');
        $('#loan-options-container').removeClass('compress-loan-container');
        $('.extra-container').addClass('show-more-options');
        $('#select-less-options').addClass('show-more-options');
        $('#loan-options-container').addClass('expand-loan-container');
    });


	//keeps search box following you as you scroll
    $(window).trigger('scroll');
    $(window).scroll(function() {
        var height = $(window).scrollTop();
        if (height > 350) {
            $('#loan-options-container').addClass('fixed-options');
            $('#loan-options-container').removeClass('bottom-fixed-options');
        }
        if (height <= 350) {
            $('#loan-options-container').removeClass('fixed-options');
            $('#loan-options-container').removeClass('bottom-fixed-options');
        }
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 150) {
            $('#loan-options-container').addClass('bottom-fixed-options');
        }
    });


    //function that interacts with API to pull mortgage offers in JSON format
    function getMortgageOffers() {
        ltConfig = {
            purchase: {
                'RequestedLoanTypeId': '1',
                'EstimatedPurchasePrice': removeCurrency($('#estimated-property-value').val()),
                'EstimatedDownPayment': removeCurrency($('#down-payment-value').val())
            },
            refinance: {
                'RequestedLoanTypeId': '2',
                'EstimatedPropertyValue': removeCurrency($('#estimated-property-value').val()),
                'CurrentMortgageBalance': removeCurrency($('#current-loan-balance-selector').val()),
                'RequestedCashoutAmount': removeCurrency($('#cash-out-value').val())
            },
            'ApiKey': 'exp_flRMmm0LtS',
            'ESourceId': '6141796',
            'PhoneNumberKey': '6141796',
            'CustomerIpAddress': '199.106.147.10',
            'PropertyZipCode': $('#zip-code-value').val(),
            'EstimatedCreditScoreBandId': $('#estimated-credit-value').val(),
            'PropertyTypeId': $('#property-type-id').val(),
            'VeteranStatusTypeId': $('#va-status-id').val(),
            'PropertyUseId': $('#property-use-id').val(),
            'RequestedLoanProgramIds': requestedLoanTypes(),
            'PrepaymentPenaltyAccepted': 'true',
            'CurrentMonthlyPayment': '0',
            'CurrentMortgageInterestRatePercent': '0',
            'CurrentLoanOriginatedYear': '2010',
            'CurrentLoanOwnerId': '1',
            'BankruptcyDischargedId': $('#bk-status-id').val(),
            'ForeclosureDischargedId': $('#foreclosure-status-id').val(),
            'SecondLienMortgageBalance': $('#second-loan-id').val()
        };
		
        var requestURLparams = '';
        requestURLparams += getObjectKeyValues(ltConfig);
        purchaseVar = $('#loan-purpose-selector').val() == '2' ? true : false;
        requestURLparams += purchaseVar == true ? getObjectKeyValues(ltConfig.purchase) : getObjectKeyValues(ltConfig.refinance);
        var requestURL = 'https://publishingpartners.lendingtree.com/quotes/v1/?' + requestURLparams + 'callback=?';
        $.ajax({
            type: 'GET',
            url: requestURL,
            cache: true,
            contentType: 'application/json',
            dataType: 'jsonp',
            success: function(result) {
                var cleanedOffers = bestOffers(result);
                loadOffers(cleanedOffers);
                if (result.OffersPending && (loadTry <= maxLoadTries)) {
                    setTimeout(function() {
                        loadTry++;
                        getMortgageOffers();
                    }, 100);
                } else {
                    if ($('#allOfferRows').find('.offer-row').length <= 0) {
                        $('#allOfferRows').html('<div id="error-results"><p>Oops. We have <strong>0</strong> quotes that met your criteria.</p><p><span>Modify your search or try again to view quotes.</span></p></div>');
                        $('#error-results').css('display', 'block'); //.show() or .hide()
                    }
                    loadTry = 0;
                }
            },
            error: function(e) {
                $('#allOfferRows').append('<div id="error-results"><p>Oops. We have <strong>0</strong> quotes that met your criteria.</p><p><span>Modify your search to view quotes.</span></p></div>');
                $('#error-results').css('display', 'block'); //.show() or .hide()
            },
            complete: function() {
            }
        });
    }

	//determine between refinance or mortgage in API
    function getObjectKeyValues(object) {
        var returnVal = '';
        for (var key in object) {
            if (typeof object[key] !== 'object') {
                returnVal += key + '=' + object[key] + '&';
            }
        }
        return returnVal;
    }

	//formats between down payment or refinance balances
    function loanTypeValueDetails(a) {
        text = "";
        if (1 == a) {
            text += "Loan Amount: $" + offers.Offers[i].LoanAmount + "<br/>Down Payment: $" + ltConfig.purchase.EstimatedDownPayment + "<br/>";
            return text;
        }
        if (2 == a) {
            text += "<br/>First Mortgage Balance: $" + ltConfig.refinance.FirstMortgageBalance + "<br/>Second Mortgage Balance: $" + ltConfig.refinance.SecondMortgageBalance + "<br/>Cash Out Amount: $" + ltConfig.refinance.CashOutAmount + "<br/>Requested Loan Amount: $" + addRefinanceAmounts() + "<br/>";
            return text;
        }
        return text;
    }

	//adds up all refinancing fees
    function addRefinanceAmounts() {
        return +ltConfig.refinance.CashOutAmount + +ltConfig.refinance.SecondMortgageBalance + +ltConfig.refinance.FirstMortgageBalance;
    }

	//formats JSON data serch results
    function loadOffers(offers) {
        //if RequestedLoanIDType = 2 --- refinance
        lenders = lendersGlobal;
        offers = offersGlobal;
        text = '';
        for (var i = 0; i < offers.length; i++) {
            lender = lenderInfo(offers[i].LenderId, lenders);
            text += "<div class='offer-row' lenderrating='" + starRating(lender.AverageCustomerServiceRating) + "' lendername='" + lenderPartialName(lender.Name) + "'><div class='lender-section'><a href='" + offersGlobal[i].Links[0].Href + "' target='_blank'><img src='" + lender.LogoUrl + "'/></a><span class='nmls'><strong>NMLS ID:</strong> " + lender.NMLSID + "</span><div class='star-rating'><span style='width:" + starRating(lender.AverageCustomerServiceRating) + "%;'></span></div></div><div class='rates'>" + formatDecimal(offers[i].RatePercentage) + "<br/><span>Rate</span></div><div class='apr'>" + formatDecimal(offers[i].APRPercentage) + "<br/><span>APR</span></div><div class='rates-fees lpID" + offersGlobal[i].LoanProgramId + "'><strong>" + offers[i].LoanProductName + "</strong><br/>" + formatCurrency(offers[i].TotalMonthlyPayment) + " payment<br/>" + formatCurrency(offers[i].TotalFees) + " in fees</div>" + "<div class='contact-details'><a href='" + offers[i].Links[0].Href + "' class='btn-primary' target='_blank'>Contact Lender</a><br/>" + "<span class='toll-free-number'>Call Toll Free</span><br/><span class='lender-phone'>" + formatPhone(offers[i].TelephoneNumber) + "</span><br/><br/><a class='sample-overlay' offerId='" + i + "' href='#'>+ View Details</a></div></div>";
        }
        if (text.length > 0) {
            $('#allOfferRows').html(text);
        }
    }

	//calculates loan term in years
    function loanTerm(number) {
        var years = number / 12;
        return years;
    }

	//figures out lender name
    function lenderInfo(number, lenders) {
        var finalLender = '';
        for (var i = 0; i < lenders.length; i++) {
            if (number == lenders[i].LenderId) {
                finalLender = lenders[i];
                return finalLender;
            }
        }
        return finalLender;
    }

	//purchase vs refinance
    function loanType(number) {
        if (number) return "Purchase";
        else return "Refinance";
    }

	//format APR
    function formatDecimal(number) {
        var numDigits = number.toString().length;
        if (numDigits === 1) {
            number = number.toString() + ".000%";
        }
        if (numDigits === 3) {
            number = number.toString() + "00%";
        }
        if (numDigits === 4) {
            number = number.toString() + "0%";
        }
        if (numDigits === 5) {
            number = number.toString() + "%";
        }
        return number;
    }

	//add up requsted loan amount
    function requestedLoanAmount(number1, number2, number3) {
        var addedUp = parseInt(number1) + parseInt(number2) + parseInt(number3);
        return addedUp;
    }

	//subtract from requested loan amount
    function requestedLoanAmount2(number1, number2) {
        var subtractedUp = parseInt(number1) - parseInt(number2);
        return subtractedUp;
    }

	//format phone number of lender
    function formatPhone(phone) {
        phone = phone.substring(2);
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        return phone;
    }

	//subtract total fees from values
    function totalFees(number1, number2) {
        var subtracted = parseInt(number1) - parseInt(number2);
        return subtracted;
    }
	
	//figure out percentage that is discounted
    function percentDiscount(number1, number2) {
        var divided = parseInt(number1) / parseInt(number2);
        divided = divided * 100;
        divided = divided.toFixed(2);
        divided = " (" + divided + "%)";
        return divided;
    }

	//get first 4 letters of lender name
    function lenderPartialName(partial) {
        partial = partial.toLowerCase();
        return partial.substring(0, 3);
    }

	//only take best 3 offers from a given lender
    function bestOffers(offerArray) {
        var lenders = offerArray.Lenders;
        lendersGlobal = lenders;
        var offers = offerArray.Offers;
        for (var k = 0; k < lenders.length; k++) {
            var count = 0;
            currentLender = lenders[k].LenderId;
			
            for (var j = 0; j < offers.length; j++) {
                if (offers[j].LenderId == currentLender) {
                    count++;
                }
                if (count > 3) {
                    offers.splice(j, 1);
                }
            }
        }
        offersGlobal = offers;
        return offers;
    }

	//format into dollar values
    function formatCurrency(num) {
        var str = num.toString().replace(/\$/, ''),
            parts = false,
            output = [],
            i = 1,
            formatted = null;
        if (str.indexOf(".") > 0) {
            parts = str.split(".");
            str = parts[0];
        }
        str = str.split("").reverse();
        for (var j = 0, len = str.length; j < len; j++) {
            if (str[j] != ",") {
                output.push(str[j]);
                if (i % 3 == 0 && j < (len - 1)) {
                    output.push(",");
                }
                i++;
            }
        }
        formatted = output.reverse().join("");
        return ("$" + formatted + ((parts) ? "." + parts[1].substr(0, 2) : ""));
    }

	//format money value back into decimal
    function removeCurrency(number) {
        number = number.replace(/\$/, '');
        number = number.replace(/\,/, '');
        return parseInt(number);
    }

	//figure out star rating of lender
    function starRating(number) {
        number = (number / 5) * 100;
        number = Math.round(number);
        return number;
    }

	//figure out requested loan type and change in search area
    function requestedLoanTypes() {
        checkedValues = '';
        $('.loan-options-select input[type=checkbox]').each(function() {
            var sThisVal = (this.checked ? "1" : "0");
            if (sThisVal == "1") {
                checkedValues += $(this).val() + ",";
            }
        });
        checkedValues = checkedValues.substring(0, checkedValues.length - 1);
        return checkedValues;
    }

});