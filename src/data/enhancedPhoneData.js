// Enhanced Phone Data with libphonenumber integration and realistic patterns
// Merged solution combining all three approaches

const enhancedPhoneData = {
  "Australia": {
    "country_code": "+61",
    "iso2": "AU",
    "phone_length": 9, // Without country code
    "mobile_patterns": ["^4[0-9]{8}$"], // Mobile numbers start with 4
    "carriers": {
      "Telstra": {
        "prefixes": ["400", "401", "402", "403", "404", "405", "406", "407", "408", "409", 
                    "410", "411", "412", "413", "414", "415", "416", "417", "418", "419"],
        "number_pattern": "Mobile numbers 400-419 followed by 6 digits",
        "realistic_ranges": {
          "400": { "start": "400000000", "end": "409999999" },
          "410": { "start": "410000000", "end": "419999999" }
        }
      },
      "Optus": {
        "prefixes": ["420", "421", "422", "423", "424", "425", "426", "427", "428", "429",
                    "430", "431", "432", "433", "434", "435", "436", "437", "438", "439"],
        "number_pattern": "Mobile numbers 420-439 followed by 6 digits",
        "realistic_ranges": {
          "420": { "start": "420000000", "end": "429999999" },
          "430": { "start": "430000000", "end": "439999999" }
        }
      },
      "Vodafone": {
        "prefixes": ["440", "441", "442", "443", "444", "445", "446", "447", "448", "449",
                    "450", "451", "452", "453", "454", "455", "456", "457", "458", "459"],
        "number_pattern": "Mobile numbers 440-459 followed by 6 digits",
        "realistic_ranges": {
          "440": { "start": "440000000", "end": "449999999" },
          "450": { "start": "450000000", "end": "459999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["000", "111", "112", "999"] // Emergency and service numbers to avoid
  },

  "New Zealand": {
    "country_code": "+64",
    "iso2": "NZ", 
    "phone_length": 9,
    "mobile_patterns": ["^2[0-9]{7,8}$"],
    "carriers": {
      "One NZ (Vodafone)": {
        "prefixes": ["210", "211", "212", "213", "214", "215", "216", "217", "218", "219"],
        "number_pattern": "Mobile numbers 210-219 followed by 6 digits",
        "realistic_ranges": {
          "210": { "start": "210000000", "end": "219999999" }
        }
      },
      "2degrees": {
        "prefixes": ["220", "221", "222", "223", "224", "225", "226", "227", "228", "229"],
        "number_pattern": "Mobile numbers 220-229 followed by 6 digits", 
        "realistic_ranges": {
          "220": { "start": "220000000", "end": "229999999" }
        }
      },
      "Spark": {
        "prefixes": ["270", "271", "272", "273", "274", "275", "276", "277", "278", "279"],
        "number_pattern": "Mobile numbers 270-279 followed by 6 digits",
        "realistic_ranges": {
          "270": { "start": "270000000", "end": "279999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["000", "111", "112", "999"]
  },

  "Dominican Republic": {
    "country_code": ["+1809", "+1829", "+1849"],
    "iso2": "DO",
    "phone_length": 7, // Local number length
    "mobile_patterns": ["^[2-9][0-9]{6}$"], // Avoid 0 and 1 as first digit
    "carriers": {
      "Claro": {
        "prefixes": ["2", "3", "4", "5"],
        "number_pattern": "7-digit numbers starting with 2-5",
        "realistic_ranges": {
          "2": { "start": "2000000", "end": "2999999" },
          "3": { "start": "3000000", "end": "3999999" }
        }
      },
      "Altice": {
        "prefixes": ["6", "7", "8"],
        "number_pattern": "7-digit numbers starting with 6-8", 
        "realistic_ranges": {
          "6": { "start": "6000000", "end": "6999999" },
          "7": { "start": "7000000", "end": "7999999" }
        }
      },
      "Viva": {
        "prefixes": ["9"],
        "number_pattern": "7-digit numbers starting with 9",
        "realistic_ranges": {
          "9": { "start": "9000000", "end": "9999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611", "711", "811"]
  },

  "United States": {
    "country_code": "+1",
    "iso2": "US",
    "phone_length": 10, // Including area code
    "mobile_patterns": ["^[2-9][0-8][0-9][2-9][0-9]{6}$"],
    "carriers": {
      "Verizon": {
        "prefixes": ["201", "202", "203", "212", "213", "214", "215", "216", "217", "218"],
        "number_pattern": "10-digit numbers with valid area codes",
        "realistic_ranges": {
          "201": { "start": "2010000000", "end": "2019999999" },
          "212": { "start": "2120000000", "end": "2129999999" }
        }
      },
      "AT&T": {
        "prefixes": ["301", "302", "303", "312", "313", "314", "315", "316", "317", "318"],
        "number_pattern": "10-digit numbers with valid area codes",
        "realistic_ranges": {
          "301": { "start": "3010000000", "end": "3019999999" },
          "312": { "start": "3120000000", "end": "3129999999" }
        }
      },
      "T-Mobile": {
        "prefixes": ["401", "402", "403", "412", "413", "414", "415", "416", "417", "418"],
        "number_pattern": "10-digit numbers with valid area codes",
        "realistic_ranges": {
          "401": { "start": "4010000000", "end": "4019999999" },
          "412": { "start": "4120000000", "end": "4129999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611", "711", "811", "N11", "N00"]
  },

  "Canada": {
    "country_code": "+1",
    "iso2": "CA", 
    "phone_length": 10,
    "mobile_patterns": ["^[2-9][0-8][0-9][2-9][0-9]{6}$"],
    "carriers": {
      "Rogers": {
        "prefixes": ["416", "647", "437", "905", "289", "365"],
        "number_pattern": "10-digit numbers with Canadian area codes",
        "realistic_ranges": {
          "416": { "start": "4160000000", "end": "4169999999" },
          "647": { "start": "6470000000", "end": "6479999999" }
        }
      },
      "Bell": {
        "prefixes": ["514", "438", "450", "579", "581", "418"],
        "number_pattern": "10-digit numbers with Canadian area codes", 
        "realistic_ranges": {
          "514": { "start": "5140000000", "end": "5149999999" },
          "438": { "start": "4380000000", "end": "4389999999" }
        }
      },
      "Telus": {
        "prefixes": ["604", "778", "236", "250", "672", "778"],
        "number_pattern": "10-digit numbers with Canadian area codes",
        "realistic_ranges": {
          "604": { "start": "6040000000", "end": "6049999999" },
          "778": { "start": "7780000000", "end": "7789999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611", "711", "811"]
  },

  "United Kingdom": {
    "country_code": "+44",
    "iso2": "GB",
    "phone_length": 10, // Without leading 0
    "mobile_patterns": ["^7[0-9]{9}$"],
    "carriers": {
      "EE": {
        "prefixes": ["7400", "7401", "7402", "7403", "7404", "7405", "7406", "7407", "7408", "7409"],
        "number_pattern": "Mobile numbers 7400-7499 followed by 6 digits",
        "realistic_ranges": {
          "7400": { "start": "7400000000", "end": "7409999999" }
        }
      },
      "O2": {
        "prefixes": ["7500", "7501", "7502", "7503", "7504", "7505", "7506", "7507", "7508", "7509"],
        "number_pattern": "Mobile numbers 7500-7599 followed by 6 digits",
        "realistic_ranges": {
          "7500": { "start": "7500000000", "end": "7509999999" }
        }
      },
      "Vodafone": {
        "prefixes": ["7700", "7701", "7702", "7703", "7704", "7705", "7706", "7707", "7708", "7709"],
        "number_pattern": "Mobile numbers 7700-7799 followed by 6 digits", 
        "realistic_ranges": {
          "7700": { "start": "7700000000", "end": "7709999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["999", "112", "101", "111"]
  },

  "Germany": {
    "country_code": "+49",
    "iso2": "DE",
    "phone_length": 11, // Mobile numbers are 11 digits total
    "mobile_patterns": ["^1[5-7][0-9]{8,9}$"],
    "carriers": {
      "Deutsche Telekom": {
        "prefixes": ["150", "151", "152", "160", "161", "162", "170", "171", "172"],
        "number_pattern": "Mobile numbers 150-179 followed by 7-8 digits",
        "realistic_ranges": {
          "150": { "start": "15000000000", "end": "15099999999" },
          "160": { "start": "16000000000", "end": "16099999999" }
        }
      },
      "Vodafone": {
        "prefixes": ["155", "156", "157", "165", "166", "167", "175", "176", "177"],
        "number_pattern": "Mobile numbers 155-179 followed by 7-8 digits",
        "realistic_ranges": {
          "155": { "start": "15500000000", "end": "15599999999" },
          "165": { "start": "16500000000", "end": "16599999999" }
        }
      },
      "O2": {
        "prefixes": ["159", "169", "179"],
        "number_pattern": "Mobile numbers 159, 169, 179 followed by 8 digits",
        "realistic_ranges": {
          "159": { "start": "15900000000", "end": "15999999999" },
          "169": { "start": "16900000000", "end": "16999999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["110", "112", "118", "19222"]
  },

  "France": {
    "country_code": "+33",
    "iso2": "FR",
    "phone_length": 9, // Without leading 0
    "mobile_patterns": ["^[67][0-9]{8}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["600", "601", "602", "603", "604", "605", "606", "607", "608", "609"],
        "number_pattern": "Mobile numbers 600-699 followed by 6 digits",
        "realistic_ranges": {
          "600": { "start": "600000000", "end": "609999999" }
        }
      },
      "SFR": {
        "prefixes": ["610", "611", "612", "613", "614", "615", "616", "617", "618", "619"],
        "number_pattern": "Mobile numbers 610-699 followed by 6 digits",
        "realistic_ranges": {
          "610": { "start": "610000000", "end": "619999999" }
        }
      },
      "Bouygues": {
        "prefixes": ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709"],
        "number_pattern": "Mobile numbers 700-799 followed by 6 digits",
        "realistic_ranges": {
          "700": { "start": "700000000", "end": "709999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["15", "17", "18", "112", "114", "115", "116", "119"]
  },

  "Italy": {
    "country_code": "+39",
    "iso2": "IT",
    "phone_length": 10, // Mobile numbers
    "mobile_patterns": ["^3[0-9]{8,9}$"],
    "carriers": {
      "TIM": {
        "prefixes": ["330", "331", "332", "333", "334", "335", "336", "337", "338", "339"],
        "number_pattern": "Mobile numbers 330-399 followed by 6-7 digits",
        "realistic_ranges": {
          "330": { "start": "3300000000", "end": "3309999999" },
          "335": { "start": "3350000000", "end": "3359999999" }
        }
      },
      "Vodafone": {
        "prefixes": ["340", "341", "342", "343", "344", "345", "346", "347", "348", "349"],
        "number_pattern": "Mobile numbers 340-399 followed by 6-7 digits",
        "realistic_ranges": {
          "340": { "start": "3400000000", "end": "3409999999" },
          "345": { "start": "3450000000", "end": "3459999999" }
        }
      },
      "WindTre": {
        "prefixes": ["380", "381", "382", "383", "384", "385", "386", "387", "388", "389"],
        "number_pattern": "Mobile numbers 380-399 followed by 6-7 digits", 
        "realistic_ranges": {
          "380": { "start": "3800000000", "end": "3809999999" },
          "385": { "start": "3850000000", "end": "3859999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["112", "113", "115", "117", "118"]
  },

  // Caribbean Countries (from your original data)
  "Saint Lucia": {
    "country_code": "+1758",
    "iso2": "LC",
    "phone_length": 7,
    "mobile_patterns": ["^[2-4][0-9]{6}$"],
    "carriers": {
      "FLOW": {
        "prefixes": ["2"],
        "number_pattern": "Mobile numbers start with +1-758-2 followed by 6 digits",
        "realistic_ranges": {
          "2": { "start": "2000000", "end": "2999999" }
        }
      },
      "Digicel": {
        "prefixes": ["3", "4"],
        "number_pattern": "Mobile numbers start with +1-758-3 or +1-758-4 followed by 6 digits",
        "realistic_ranges": {
          "3": { "start": "3000000", "end": "3999999" },
          "4": { "start": "4000000", "end": "4999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Saint Vincent and the Grenadines": {
    "country_code": "+1784",
    "iso2": "VC",
    "phone_length": 7,
    "mobile_patterns": ["^[3-5][0-9]{6}$"],
    "carriers": {
      "Green Dot": {
        "prefixes": ["4"],
        "number_pattern": "Mobile numbers start with +1-784-4 followed by 6 digits",
        "realistic_ranges": {
          "4": { "start": "4000000", "end": "4999999" }
        }
      },
      "Flow": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers start with +1-784-5 followed by 6 digits",
        "realistic_ranges": {
          "5": { "start": "5000000", "end": "5999999" }
        }
      },
      "Digicel": {
        "prefixes": ["3"],
        "number_pattern": "Mobile numbers start with +1-784-3 followed by 6 digits",
        "realistic_ranges": {
          "3": { "start": "3000000", "end": "3999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Dominica": {
    "country_code": "+1767",
    "iso2": "DM",
    "phone_length": 7,
    "mobile_patterns": ["^[2-4][0-9]{6}$"],
    "carriers": {
      "Digicel": {
        "prefixes": ["2"],
        "number_pattern": "Mobile numbers start with +1-767-2 followed by 6 digits",
        "realistic_ranges": {
          "2": { "start": "2000000", "end": "2999999" }
        }
      },
      "Flow (LIME)": {
        "prefixes": ["4"],
        "number_pattern": "Mobile numbers start with +1-767-4 followed by 6 digits",
        "realistic_ranges": {
          "4": { "start": "4000000", "end": "4999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Barbados": {
    "country_code": "+1246",
    "iso2": "BB",
    "phone_length": 7,
    "mobile_patterns": ["^24[2-6][0-9]{4}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["242", "243"],
        "number_pattern": "Mobile numbers starting with 242 or 243",
        "realistic_ranges": {
          "242": { "start": "2420000", "end": "2429999" },
          "243": { "start": "2430000", "end": "2439999" }
        }
      },
      "Digicel": {
        "prefixes": ["245", "246"],
        "number_pattern": "Mobile numbers starting with 245 or 246",
        "realistic_ranges": {
          "245": { "start": "2450000", "end": "2459999" },
          "246": { "start": "2460000", "end": "2469999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Aruba": {
    "country_code": "+297",
    "iso2": "AW",
    "phone_length": 7,
    "mobile_patterns": ["^[5-6][0-9]{6}$"],
    "carriers": {
      "Setar": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits",
        "realistic_ranges": {
          "5": { "start": "5000000", "end": "5999999" }
        }
      },
      "Digicel": {
        "prefixes": ["6"],
        "number_pattern": "Mobile numbers starting with 6 followed by 6 digits",
        "realistic_ranges": {
          "6": { "start": "6000000", "end": "6999999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "100"]
  },

  "Saint Kitts and Nevis": {
    "country_code": "+1869",
    "iso2": "KN",
    "phone_length": 7,
    "mobile_patterns": ["^[4-5][0-9]{6}$"],
    "carriers": {
      "Digicel": {
        "prefixes": ["412", "413"],
        "number_pattern": "Mobile numbers start with 412 or 413",
        "realistic_ranges": {
          "412": { "start": "4120000", "end": "4129999" },
          "413": { "start": "4130000", "end": "4139999" }
        }
      },
      "Flow": {
        "prefixes": ["514", "515"],
        "number_pattern": "Mobile numbers start with 514 or 515",
        "realistic_ranges": {
          "514": { "start": "5140000", "end": "5149999" },
          "515": { "start": "5150000", "end": "5159999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Sint Maarten": {
    "country_code": "+1721",
    "iso2": "SX",
    "phone_length": 7,
    "mobile_patterns": ["^5[1-3][0-9]{5}$"],
    "carriers": {
      "Telcell": {
        "prefixes": ["510", "511"],
        "number_pattern": "Mobile numbers start with +1-721-510 or 511 followed by 4 digits",
        "realistic_ranges": {
          "510": { "start": "5100000", "end": "5109999" },
          "511": { "start": "5110000", "end": "5119999" }
        }
      },
      "Flow": {
        "prefixes": ["520", "521"],
        "number_pattern": "Mobile numbers start with +1-721-520 or 521 followed by 4 digits",
        "realistic_ranges": {
          "520": { "start": "5200000", "end": "5209999" },
          "521": { "start": "5210000", "end": "5219999" }
        }
      },
      "Digicel": {
        "prefixes": ["530", "531"],
        "number_pattern": "Mobile numbers start with +1-721-530 or 531 followed by 4 digits",
        "realistic_ranges": {
          "530": { "start": "5300000", "end": "5309999" },
          "531": { "start": "5310000", "end": "5319999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "411", "611"]
  },

  "Trinidad and Tobago": {
    "country_code": "+1868",
    "iso2": "TT",
    "phone_length": 7,
    "mobile_patterns": ["^[2-7][0-9]{6}$"],
    "carriers": {
      "Digicel": {
        "prefixes": ["299", "300", "301", "302", "303", "304", "305"],
        "number_pattern": "Mobile numbers start with 299-305 followed by 4 digits",
        "realistic_ranges": {
          "299": { "start": "2990000", "end": "2999999" },
          "300": { "start": "3000000", "end": "3009999" },
          "301": { "start": "3010000", "end": "3019999" }
        }
      },
      "bmobile": {
        "prefixes": ["680", "681", "682", "683", "684", "685"],
        "number_pattern": "Mobile numbers start with 680-685 followed by 4 digits",
        "realistic_ranges": {
          "680": { "start": "6800000", "end": "6809999" },
          "681": { "start": "6810000", "end": "6819999" },
          "682": { "start": "6820000", "end": "6829999" }
        }
      },
      "LaqTel": {
        "prefixes": ["720", "721", "722", "723"],
        "number_pattern": "Mobile numbers start with 720-723 followed by 4 digits",
        "realistic_ranges": {
          "720": { "start": "7200000", "end": "7209999" },
          "721": { "start": "7210000", "end": "7219999" }
        }
      }
    },
    "forbidden_patterns": ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999"],
    "service_ranges": ["911", "990", "999", "411"]
  }
};

module.exports = { enhancedPhoneData };