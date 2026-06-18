const PIN_CODE_DATA = {
  // Delhi
  "110001": { city: "New Delhi", state: "Delhi", postOffice: "Connaught Place" },
  "110011": { city: "New Delhi", state: "Delhi", postOffice: "South Delhi" },
  "110020": { city: "New Delhi", state: "Delhi", postOffice: "Dwarka" },
  "110092": { city: "New Delhi", state: "Delhi", postOffice: "Shahdara" },

  // Maharashtra
  "400001": { city: "Mumbai", state: "Maharashtra", postOffice: "Mumbai GPO" },
  "400051": { city: "Mumbai", state: "Maharashtra", postOffice: "Bandra" },
  "400076": { city: "Mumbai", state: "Maharashtra", postOffice: "Powai" },
  "411001": { city: "Pune", state: "Maharashtra", postOffice: "Pune GPO" },
  "411045": { city: "Pune", state: "Maharashtra", postOffice: "Wakad" },
  "440001": { city: "Nagpur", state: "Maharashtra", postOffice: "Nagpur GPO" },

  // Karnataka
  "560001": { city: "Bengaluru", state: "Karnataka", postOffice: "Bangalore GPO" },
  "560034": { city: "Bengaluru", state: "Karnataka", postOffice: "Koramangala" },
  "560066": { city: "Bengaluru", state: "Karnataka", postOffice: "Whitefield" },
  "575001": { city: "Mangaluru", state: "Karnataka", postOffice: "Mangalore GPO" },

  // Tamil Nadu
  "600001": { city: "Chennai", state: "Tamil Nadu", postOffice: "Chennai GPO" },
  "600041": { city: "Chennai", state: "Tamil Nadu", postOffice: "Adyar" },
  "641001": { city: "Coimbatore", state: "Tamil Nadu", postOffice: "Coimbatore GPO" },
  "625001": { city: "Madurai", state: "Tamil Nadu", postOffice: "Madurai GPO" },

  // Telangana
  "500001": { city: "Hyderabad", state: "Telangana", postOffice: "Hyderabad GPO" },
  "500034": { city: "Hyderabad", state: "Telangana", postOffice: "Banjara Hills" },
  "500081": { city: "Hyderabad", state: "Telangana", postOffice: "Kondapur" },

  // West Bengal
  "700001": { city: "Kolkata", state: "West Bengal", postOffice: "Kolkata GPO" },
  "700019": { city: "Kolkata", state: "West Bengal", postOffice: "Ballygunge" },
  "700091": { city: "Kolkata", state: "West Bengal", postOffice: "Salt Lake" },

  // Gujarat
  "380001": { city: "Ahmedabad", state: "Gujarat", postOffice: "Ahmedabad GPO" },
  "380015": { city: "Ahmedabad", state: "Gujarat", postOffice: "Satellite" },
  "395001": { city: "Surat", state: "Gujarat", postOffice: "Surat GPO" },
  "361001": { city: "Jamnagar", state: "Gujarat", postOffice: "Jamnagar GPO" },

  // Rajasthan
  "302001": { city: "Jaipur", state: "Rajasthan", postOffice: "Jaipur GPO" },
  "302017": { city: "Jaipur", state: "Rajasthan", postOffice: "Vaishali Nagar" },
  "342001": { city: "Jodhpur", state: "Rajasthan", postOffice: "Jodhpur GPO" },

  // Uttar Pradesh
  "226001": { city: "Lucknow", state: "Uttar Pradesh", postOffice: "Lucknow GPO" },
  "226010": { city: "Lucknow", state: "Uttar Pradesh", postOffice: "Gomti Nagar" },
  "201301": { city: "Noida", state: "Uttar Pradesh", postOffice: "Noida Sector 18" },
  "208001": { city: "Kanpur", state: "Uttar Pradesh", postOffice: "Kanpur GPO" },
  "282001": { city: "Agra", state: "Uttar Pradesh", postOffice: "Agra GPO" },

  // Madhya Pradesh
  "462001": { city: "Bhopal", state: "Madhya Pradesh", postOffice: "Bhopal GPO" },
  "452001": { city: "Indore", state: "Madhya Pradesh", postOffice: "Indore GPO" },

  // Haryana
  "122001": { city: "Gurugram", state: "Haryana", postOffice: "Gurugram GPO" },
  "131001": { city: "Sonipat", state: "Haryana", postOffice: "Sonipat GPO" },
  "121001": { city: "Faridabad", state: "Haryana", postOffice: "Faridabad GPO" },

  // Punjab
  "160001": { city: "Chandigarh", state: "Chandigarh", postOffice: "Chandigarh GPO" },
  "141001": { city: "Ludhiana", state: "Punjab", postOffice: "Ludhiana GPO" },
  "143001": { city: "Amritsar", state: "Punjab", postOffice: "Amritsar GPO" },

  // Andhra Pradesh
  "530001": { city: "Visakhapatnam", state: "Andhra Pradesh", postOffice: "Vizag GPO" },
  "520001": { city: "Vijayawada", state: "Andhra Pradesh", postOffice: "Vijayawada GPO" },

  // Kerala
  "682001": { city: "Kochi", state: "Kerala", postOffice: "Kochi GPO" },
  "695001": { city: "Thiruvananthapuram", state: "Kerala", postOffice: "Trivandrum GPO" },
  "670001": { city: "Kannur", state: "Kerala", postOffice: "Kannur GPO" },

  // Bihar
  "800001": { city: "Patna", state: "Bihar", postOffice: "Patna GPO" },
  "800020": { city: "Patna", state: "Bihar", postOffice: "Boring Road" },

  // Chhattisgarh
  "492001": { city: "Raipur", state: "Chhattisgarh", postOffice: "Raipur GPO" },

  // Uttarakhand
  "248001": { city: "Dehradun", state: "Uttarakhand", postOffice: "Dehradun GPO" },
  "249401": { city: "Rishikesh", state: "Uttarakhand", postOffice: "Rishikesh GPO" },

  // Himachal Pradesh
  "171001": { city: "Shimla", state: "Himachal Pradesh", postOffice: "Shimla GPO" },

  // Jammu & Kashmir
  "190001": { city: "Srinagar", state: "Jammu & Kashmir", postOffice: "Srinagar GPO" },
  "180001": { city: "Jammu", state: "Jammu & Kashmir", postOffice: "Jammu GPO" },

  // Odisha
  "751001": { city: "Bhubaneswar", state: "Odisha", postOffice: "Bhubaneswar GPO" },
  "753001": { city: "Cuttack", state: "Odisha", postOffice: "Cuttack GPO" },

  // Assam
  "781001": { city: "Guwahati", state: "Assam", postOffice: "Guwahati GPO" },
  "786001": { city: "Dibrugarh", state: "Assam", postOffice: "Dibrugarh GPO" },

  // Jharkhand
  "834001": { city: "Ranchi", state: "Jharkhand", postOffice: "Ranchi GPO" },
  "831001": { city: "Jamshedpur", state: "Jharkhand", postOffice: "Jamshedpur GPO" },

  // Goa
  "403001": { city: "Panaji", state: "Goa", postOffice: "Panaji GPO" },
  "403601": { city: "Margao", state: "Goa", postOffice: "Margao GPO" },

  // Tripura
  "799001": { city: "Agartala", state: "Tripura", postOffice: "Agartala GPO" },

  // Meghalaya
  "793001": { city: "Shillong", state: "Meghalaya", postOffice: "Shillong GPO" },

  // Manipur
  "795001": { city: "Imphal", state: "Manipur", postOffice: "Imphal GPO" },

  // Nagaland
  "797001": { city: "Kohima", state: "Nagaland", postOffice: "Kohima GPO" },

  // Arunachal Pradesh
  "791111": { city: "Itanagar", state: "Arunachal Pradesh", postOffice: "Itanagar GPO" },

  // Mizoram
  "796001": { city: "Aizawl", state: "Mizoram", postOffice: "Aizawl GPO" },

  // Sikkim
  "737101": { city: "Gangtok", state: "Sikkim", postOffice: "Gangtok GPO" },

  // Andaman & Nicobar
  "744101": { city: "Port Blair", state: "Andaman & Nicobar", postOffice: "Port Blair GPO" },

  // Puducherry
  "605001": { city: "Puducherry", state: "Puducherry", postOffice: "Puducherry GPO" },

  // Ladakh
  "194101": { city: "Leh", state: "Ladakh", postOffice: "Leh GPO" },
};

export default PIN_CODE_DATA;
