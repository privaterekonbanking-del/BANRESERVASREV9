// Additional Countries Data - 43 More Countries to Add
// Copy this content and add it to your enhancedPhoneData.js file

const additionalCountries = {
  "United Kingdom": {
    "country_code": "+44", "iso2": "GB", "phone_length": 10,
    "mobile_patterns": ["^7[0-9]{9}$"],
    "carriers": {
      "EE": {
        "prefixes": ["7400","7401","7402","7403","7404","7405","7406","7407","7408","7409"],
        "number_pattern": "Mobile numbers 7400-7499 followed by 6 digits"
      },
      "O2": {
        "prefixes": ["7500","7501","7502","7503","7504","7505","7506","7507","7508","7509"],
        "number_pattern": "Mobile numbers 7500-7599 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["7700","7701","7702","7703","7704","7705","7706","7707","7708","7709"],
        "number_pattern": "Mobile numbers 7700-7799 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","112","101","111"]
  },

  "Canada": {
    "country_code": "+1", "iso2": "CA", "phone_length": 10,
    "mobile_patterns": ["^[2-9][0-8][0-9][2-9][0-9]{6}$"],
    "carriers": {
      "Rogers": {
        "prefixes": ["416","647","437","905","289","365"],
        "number_pattern": "10-digit numbers with Canadian area codes"
      },
      "Bell": {
        "prefixes": ["514","438","450","579","581","418"],
        "number_pattern": "10-digit numbers with Canadian area codes"
      },
      "Telus": {
        "prefixes": ["604","778","236","250","672","403"],
        "number_pattern": "10-digit numbers with Canadian area codes"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","411","611"]
  },

  "Italy": {
    "country_code": "+39", "iso2": "IT", "phone_length": 10,
    "mobile_patterns": ["^3[0-9]{8,9}$"],
    "carriers": {
      "TIM": {
        "prefixes": ["330","331","332","333","334","335","336","337","338","339"],
        "number_pattern": "Mobile numbers 330-399 followed by 6-7 digits"
      },
      "Vodafone": {
        "prefixes": ["340","341","342","343","344","345","346","347","348","349"],
        "number_pattern": "Mobile numbers 340-399 followed by 6-7 digits"
      },
      "WindTre": {
        "prefixes": ["380","381","382","383","384","385","386","387","388","389"],
        "number_pattern": "Mobile numbers 380-399 followed by 6-7 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","113","115","117","118"]
  },

  "France": {
    "country_code": "+33", "iso2": "FR", "phone_length": 9,
    "mobile_patterns": ["^[67][0-9]{8}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["600","601","602","603","604","605","606","607","608","609"],
        "number_pattern": "Mobile numbers 600-699 followed by 6 digits"
      },
      "SFR": {
        "prefixes": ["610","611","612","613","614","615","616","617","618","619"],
        "number_pattern": "Mobile numbers 610-699 followed by 6 digits"
      },
      "Bouygues": {
        "prefixes": ["700","701","702","703","704","705","706","707","708","709"],
        "number_pattern": "Mobile numbers 700-799 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["15","17","18","112","114","115","116","119"]
  },

  "Belize": {
    "country_code": "+501", "iso2": "BZ", "phone_length": 7,
    "mobile_patterns": ["^[6-7][0-9]{6}$"],
    "carriers": {
      "Belize Telemedia": {
        "prefixes": ["6"],
        "number_pattern": "Mobile numbers starting with 6 followed by 6 digits"
      },
      "Smart": {
        "prefixes": ["7"],
        "number_pattern": "Mobile numbers starting with 7 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","90"]
  },

  "Turks and Caicos": {
    "country_code": "+1649", "iso2": "TC", "phone_length": 7,
    "mobile_patterns": ["^[2-4][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["2","3"],
        "number_pattern": "Mobile numbers starting with 2-3 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["4"],
        "number_pattern": "Mobile numbers starting with 4 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Guadeloupe": {
    "country_code": "+590", "iso2": "GP", "phone_length": 9,
    "mobile_patterns": ["^69[0-9]{7}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["690","691","692","693"],
        "number_pattern": "Mobile numbers 690-699 followed by 6 digits"
      },
      "SFR": {
        "prefixes": ["694","695","696","697"],
        "number_pattern": "Mobile numbers 694-699 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["15","17","18"]
  },

  "Martinique": {
    "country_code": "+596", "iso2": "MQ", "phone_length": 9,
    "mobile_patterns": ["^69[0-9]{7}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["696","697"],
        "number_pattern": "Mobile numbers 696-697 followed by 6 digits"
      },
      "SFR": {
        "prefixes": ["692","693"],
        "number_pattern": "Mobile numbers 692-693 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["15","17","18"]
  },

  "French Guyana": {
    "country_code": "+594", "iso2": "GF", "phone_length": 9,
    "mobile_patterns": ["^69[0-9]{7}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["694","695"],
        "number_pattern": "Mobile numbers 694-695 followed by 6 digits"
      },
      "SFR": {
        "prefixes": ["692","693"],
        "number_pattern": "Mobile numbers 692-693 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["15","17","18"]
  },

  "Netherlands": {
    "country_code": "+31", "iso2": "NL", "phone_length": 9,
    "mobile_patterns": ["^6[0-9]{8}$"],
    "carriers": {
      "KPN": {
        "prefixes": ["610","611","612","613","614","615"],
        "number_pattern": "Mobile numbers 610-619 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["620","621","622","623","624","625"],
        "number_pattern": "Mobile numbers 620-629 followed by 6 digits"
      },
      "T-Mobile": {
        "prefixes": ["630","631","632","633","634","635"],
        "number_pattern": "Mobile numbers 630-639 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","144"]
  },

  "Ireland": {
    "country_code": "+353", "iso2": "IE", "phone_length": 9,
    "mobile_patterns": ["^8[0-9]{8}$"],
    "carriers": {
      "Three": {
        "prefixes": ["830","831","832","833"],
        "number_pattern": "Mobile numbers 830-839 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["850","851","852","853"],
        "number_pattern": "Mobile numbers 850-859 followed by 6 digits"
      },
      "Eir": {
        "prefixes": ["870","871","872","873"],
        "number_pattern": "Mobile numbers 870-879 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","999"]
  },

  "Grenada": {
    "country_code": "+1473", "iso2": "GD", "phone_length": 7,
    "mobile_patterns": ["^[4-5][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["4"],
        "number_pattern": "Mobile numbers starting with 4 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Panama": {
    "country_code": "+507", "iso2": "PA", "phone_length": 8,
    "mobile_patterns": ["^[6-7][0-9]{7}$"],
    "carriers": {
      "Claro": {
        "prefixes": ["60","61","62"],
        "number_pattern": "Mobile numbers 60-69 followed by 6 digits"
      },
      "Movistar": {
        "prefixes": ["65","66","67"],
        "number_pattern": "Mobile numbers 65-69 followed by 6 digits"
      },
      "Tigo": {
        "prefixes": ["68","69"],
        "number_pattern": "Mobile numbers 68-69 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Malaysia": {
    "country_code": "+60", "iso2": "MY", "phone_length": 10,
    "mobile_patterns": ["^1[0-9]{8,9}$"],
    "carriers": {
      "Maxis": {
        "prefixes": ["120","121","122","123","124","125"],
        "number_pattern": "Mobile numbers 120-129 followed by 7 digits"
      },
      "Celcom": {
        "prefixes": ["130","131","132","133","134","135"],
        "number_pattern": "Mobile numbers 130-139 followed by 7 digits"
      },
      "DiGi": {
        "prefixes": ["140","141","142","143","144","145"],
        "number_pattern": "Mobile numbers 140-149 followed by 7 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","994","991"]
  },

  "Singapore": {
    "country_code": "+65", "iso2": "SG", "phone_length": 8,
    "mobile_patterns": ["^[89][0-9]{7}$"],
    "carriers": {
      "Singtel": {
        "prefixes": ["80","81","82"],
        "number_pattern": "Mobile numbers 80-89 followed by 6 digits"
      },
      "StarHub": {
        "prefixes": ["90","91","92"],
        "number_pattern": "Mobile numbers 90-99 followed by 6 digits"
      },
      "M1": {
        "prefixes": ["93","94","95"],
        "number_pattern": "Mobile numbers 93-99 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","995","994"]
  },

  "Hong Kong": {
    "country_code": "+852", "iso2": "HK", "phone_length": 8,
    "mobile_patterns": ["^[569][0-9]{7}$"],
    "carriers": {
      "CSL": {
        "prefixes": ["50","51","52"],
        "number_pattern": "Mobile numbers 50-59 followed by 6 digits"
      },
      "SmarTone": {
        "prefixes": ["60","61","62"],
        "number_pattern": "Mobile numbers 60-69 followed by 6 digits"
      },
      "3HK": {
        "prefixes": ["90","91","92"],
        "number_pattern": "Mobile numbers 90-99 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","112"]
  },

  "Bahamas": {
    "country_code": "+1242", "iso2": "BS", "phone_length": 7,
    "mobile_patterns": ["^[3-5][0-9]{6}$"],
    "carriers": {
      "BTC": {
        "prefixes": ["3","4"],
        "number_pattern": "Mobile numbers starting with 3-4 followed by 6 digits"
      },
      "Aliv": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","919"]
  },

  "Guyana": {
    "country_code": "+592", "iso2": "GY", "phone_length": 7,
    "mobile_patterns": ["^[6-7][0-9]{6}$"],
    "carriers": {
      "GTT": {
        "prefixes": ["6"],
        "number_pattern": "Mobile numbers starting with 6 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["7"],
        "number_pattern": "Mobile numbers starting with 7 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","912"]
  },

  "Suriname": {
    "country_code": "+597", "iso2": "SR", "phone_length": 7,
    "mobile_patterns": ["^[6-8][0-9]{6}$"],
    "carriers": {
      "Telesur": {
        "prefixes": ["6","7"],
        "number_pattern": "Mobile numbers starting with 6-7 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["8"],
        "number_pattern": "Mobile numbers starting with 8 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","115"]
  },

  "Anguilla": {
    "country_code": "+1264", "iso2": "AI", "phone_length": 7,
    "mobile_patterns": ["^[2-5][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["2","3"],
        "number_pattern": "Mobile numbers starting with 2-3 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["4","5"],
        "number_pattern": "Mobile numbers starting with 4-5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "British Virgin Islands": {
    "country_code": "+1284", "iso2": "VG", "phone_length": 7,
    "mobile_patterns": ["^[3-5][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["3","4"],
        "number_pattern": "Mobile numbers starting with 3-4 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","999"]
  },

  "Cayman Islands": {
    "country_code": "+1345", "iso2": "KY", "phone_length": 7,
    "mobile_patterns": ["^[3-5][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["3","4"],
        "number_pattern": "Mobile numbers starting with 3-4 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Montserrat": {
    "country_code": "+1664", "iso2": "MS", "phone_length": 7,
    "mobile_patterns": ["^[4-5][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["4"],
        "number_pattern": "Mobile numbers starting with 4 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["5"],
        "number_pattern": "Mobile numbers starting with 5 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Saint Martin (French)": {
    "country_code": "+590", "iso2": "MF", "phone_length": 9,
    "mobile_patterns": ["^69[0-9]{7}$"],
    "carriers": {
      "Orange": {
        "prefixes": ["690","691"],
        "number_pattern": "Mobile numbers 690-691 followed by 6 digits"
      },
      "SFR": {
        "prefixes": ["692","693"],
        "number_pattern": "Mobile numbers 692-693 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["15","17","18"]
  },

  "Curacao": {
    "country_code": "+599", "iso2": "CW", "phone_length": 7,
    "mobile_patterns": ["^[5-9][0-9]{6}$"],
    "carriers": {
      "Flow": {
        "prefixes": ["5","6"],
        "number_pattern": "Mobile numbers starting with 5-6 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["7","8"],
        "number_pattern": "Mobile numbers starting with 7-8 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","112"]
  },

  "Bonaire": {
    "country_code": "+599", "iso2": "BQ", "phone_length": 7,
    "mobile_patterns": ["^[5-7][0-9]{6}$"],
    "carriers": {
      "Telbo": {
        "prefixes": ["5","6"],
        "number_pattern": "Mobile numbers starting with 5-6 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["7"],
        "number_pattern": "Mobile numbers starting with 7 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911","112"]
  },

  "Puerto Rico": {
    "country_code": "+1787", "iso2": "PR", "phone_length": 7,
    "mobile_patterns": ["^[2-9][0-9]{6}$"],
    "carriers": {
      "Claro": {
        "prefixes": ["2","3","4"],
        "number_pattern": "Mobile numbers starting with 2-4 followed by 6 digits"
      },
      "T-Mobile": {
        "prefixes": ["5","6","7"],
        "number_pattern": "Mobile numbers starting with 5-7 followed by 6 digits"
      },
      "AT&T": {
        "prefixes": ["8","9"],
        "number_pattern": "Mobile numbers starting with 8-9 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Bermuda": {
    "country_code": "+1441", "iso2": "BM", "phone_length": 7,
    "mobile_patterns": ["^[3-7][0-9]{6}$"],
    "carriers": {
      "One Communications": {
        "prefixes": ["3","4","5"],
        "number_pattern": "Mobile numbers starting with 3-5 followed by 6 digits"
      },
      "Digicel": {
        "prefixes": ["6","7"],
        "number_pattern": "Mobile numbers starting with 6-7 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["911"]
  },

  "Switzerland": {
    "country_code": "+41", "iso2": "CH", "phone_length": 9,
    "mobile_patterns": ["^7[0-9]{8}$"],
    "carriers": {
      "Swisscom": {
        "prefixes": ["760","761","762","763"],
        "number_pattern": "Mobile numbers 760-769 followed by 6 digits"
      },
      "Sunrise": {
        "prefixes": ["770","771","772","773"],
        "number_pattern": "Mobile numbers 770-779 followed by 6 digits"
      },
      "Salt": {
        "prefixes": ["780","781","782","783"],
        "number_pattern": "Mobile numbers 780-789 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","117","118","144"]
  },

  "Norway": {
    "country_code": "+47", "iso2": "NO", "phone_length": 8,
    "mobile_patterns": ["^[49][0-9]{7}$"],
    "carriers": {
      "Telenor": {
        "prefixes": ["40","41","42","43"],
        "number_pattern": "Mobile numbers 40-49 followed by 6 digits"
      },
      "Telia": {
        "prefixes": ["90","91","92","93"],
        "number_pattern": "Mobile numbers 90-99 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","110","113"]
  },

  "Luxembourg": {
    "country_code": "+352", "iso2": "LU", "phone_length": 9,
    "mobile_patterns": ["^6[0-9]{8}$"],
    "carriers": {
      "POST": {
        "prefixes": ["620","621","622"],
        "number_pattern": "Mobile numbers 620-629 followed by 6 digits"
      },
      "Tango": {
        "prefixes": ["630","631","632"],
        "number_pattern": "Mobile numbers 630-639 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","113"]
  },

  "Denmark": {
    "country_code": "+45", "iso2": "DK", "phone_length": 8,
    "mobile_patterns": ["^[2-9][0-9]{7}$"],
    "carriers": {
      "TDC": {
        "prefixes": ["20","21","22","23"],
        "number_pattern": "Mobile numbers 20-29 followed by 6 digits"
      },
      "Telenor": {
        "prefixes": ["40","41","42","43"],
        "number_pattern": "Mobile numbers 40-49 followed by 6 digits"
      },
      "3": {
        "prefixes": ["50","51","52","53"],
        "number_pattern": "Mobile numbers 50-59 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","114"]
  },

  "Iceland": {
    "country_code": "+354", "iso2": "IS", "phone_length": 7,
    "mobile_patterns": ["^[6-8][0-9]{6}$"],
    "carriers": {
      "Siminn": {
        "prefixes": ["6","7"],
        "number_pattern": "Mobile numbers starting with 6-7 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["8"],
        "number_pattern": "Mobile numbers starting with 8 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112"]
  },

  "Finland": {
    "country_code": "+358", "iso2": "FI", "phone_length": 9,
    "mobile_patterns": ["^[45][0-9]{8}$"],
    "carriers": {
      "Elisa": {
        "prefixes": ["400","401","402","403"],
        "number_pattern": "Mobile numbers 400-449 followed by 6 digits"
      },
      "Telia": {
        "prefixes": ["450","451","452","453"],
        "number_pattern": "Mobile numbers 450-499 followed by 6 digits"
      },
      "DNA": {
        "prefixes": ["500","501","502","503"],
        "number_pattern": "Mobile numbers 500-549 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112"]
  },

  "Malta": {
    "country_code": "+356", "iso2": "MT", "phone_length": 8,
    "mobile_patterns": ["^[79][0-9]{7}$"],
    "carriers": {
      "GO": {
        "prefixes": ["70","71","72"],
        "number_pattern": "Mobile numbers 70-79 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["90","91","92"],
        "number_pattern": "Mobile numbers 90-99 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","196"]
  },

  "Sweden": {
    "country_code": "+46", "iso2": "SE", "phone_length": 9,
    "mobile_patterns": ["^7[0-9]{8}$"],
    "carriers": {
      "Telia": {
        "prefixes": ["700","701","702","703"],
        "number_pattern": "Mobile numbers 700-739 followed by 6 digits"
      },
      "Telenor": {
        "prefixes": ["740","741","742","743"],
        "number_pattern": "Mobile numbers 740-769 followed by 6 digits"
      },
      "3": {
        "prefixes": ["730","731","732","733"],
        "number_pattern": "Mobile numbers 730-739 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","114"]
  },

  "Kuwait": {
    "country_code": "+965", "iso2": "KW", "phone_length": 8,
    "mobile_patterns": ["^[569][0-9]{7}$"],
    "carriers": {
      "Zain": {
        "prefixes": ["50","51","52"],
        "number_pattern": "Mobile numbers 50-59 followed by 6 digits"
      },
      "Ooredoo": {
        "prefixes": ["60","61","62"],
        "number_pattern": "Mobile numbers 60-69 followed by 6 digits"
      },
      "Viva": {
        "prefixes": ["90","91","92"],
        "number_pattern": "Mobile numbers 90-99 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["112","777"]
  },

  "Saudi Arabia": {
    "country_code": "+966", "iso2": "SA", "phone_length": 9,
    "mobile_patterns": ["^5[0-9]{8}$"],
    "carriers": {
      "STC": {
        "prefixes": ["500","501","502","503","504"],
        "number_pattern": "Mobile numbers 500-509 followed by 6 digits"
      },
      "Mobily": {
        "prefixes": ["560","561","562","563","564"],
        "number_pattern": "Mobile numbers 560-569 followed by 6 digits"
      },
      "Zain": {
        "prefixes": ["580","581","582","583","584"],
        "number_pattern": "Mobile numbers 580-589 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","997","911"]
  },

  "Qatar": {
    "country_code": "+974", "iso2": "QA", "phone_length": 8,
    "mobile_patterns": ["^[3567][0-9]{7}$"],
    "carriers": {
      "Ooredoo": {
        "prefixes": ["30","31","32","33"],
        "number_pattern": "Mobile numbers 30-39 followed by 6 digits"
      },
      "Vodafone": {
        "prefixes": ["50","51","52","53"],
        "number_pattern": "Mobile numbers 50-59 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","112"]
  },

  "Brunei": {
    "country_code": "+673", "iso2": "BN", "phone_length": 7,
    "mobile_patterns": ["^[7-8][0-9]{6}$"],
    "carriers": {
      "DST": {
        "prefixes": ["7"],
        "number_pattern": "Mobile numbers starting with 7 followed by 6 digits"
      },
      "Progresif": {
        "prefixes": ["8"],
        "number_pattern": "Mobile numbers starting with 8 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["991","995"]
  },

  "Maldives": {
    "country_code": "+960", "iso2": "MV", "phone_length": 7,
    "mobile_patterns": ["^[79][0-9]{6}$"],
    "carriers": {
      "Dhiraagu": {
        "prefixes": ["7"],
        "number_pattern": "Mobile numbers starting with 7 followed by 6 digits"
      },
      "Ooredoo": {
        "prefixes": ["9"],
        "number_pattern": "Mobile numbers starting with 9 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["119","102"]
  },

  "UAE": {
    "country_code": "+971", "iso2": "AE", "phone_length": 9,
    "mobile_patterns": ["^5[0-9]{8}$"],
    "carriers": {
      "Etisalat": {
        "prefixes": ["500","501","502","503","504","505"],
        "number_pattern": "Mobile numbers 500-509 followed by 6 digits"
      },
      "du": {
        "prefixes": ["560","561","562","563","564","565"],
        "number_pattern": "Mobile numbers 560-569 followed by 6 digits"
      }
    },
    "forbidden_patterns": ["0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"],
    "service_ranges": ["999","997","911"]
  }
};

module.exports = { additionalCountries };