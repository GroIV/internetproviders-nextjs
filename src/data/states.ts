// US States data for landing pages

export interface StateInfo {
  code: string
  name: string
  topCities: { name: string; zip: string }[]
}

export const states: Record<string, StateInfo> = {
  al: { code: 'AL', name: 'Alabama', topCities: [{ name: 'Birmingham', zip: '35203' }, { name: 'Montgomery', zip: '36104' }, { name: 'Huntsville', zip: '35801' }] },
  ak: { code: 'AK', name: 'Alaska', topCities: [{ name: 'Anchorage', zip: '99501' }, { name: 'Fairbanks', zip: '99701' }, { name: 'Juneau', zip: '99801' }] },
  az: { code: 'AZ', name: 'Arizona', topCities: [{ name: 'Phoenix', zip: '85001' }, { name: 'Tucson', zip: '85701' }, { name: 'Mesa', zip: '85201' }] },
  ar: { code: 'AR', name: 'Arkansas', topCities: [{ name: 'Little Rock', zip: '72201' }, { name: 'Fort Smith', zip: '72901' }, { name: 'Fayetteville', zip: '72701' }] },
  ca: { code: 'CA', name: 'California', topCities: [{ name: 'Los Angeles', zip: '90001' }, { name: 'San Francisco', zip: '94102' }, { name: 'San Diego', zip: '92101' }] },
  co: { code: 'CO', name: 'Colorado', topCities: [{ name: 'Denver', zip: '80202' }, { name: 'Colorado Springs', zip: '80903' }, { name: 'Aurora', zip: '80010' }] },
  ct: { code: 'CT', name: 'Connecticut', topCities: [{ name: 'Hartford', zip: '06103' }, { name: 'New Haven', zip: '06510' }, { name: 'Stamford', zip: '06901' }] },
  de: { code: 'DE', name: 'Delaware', topCities: [{ name: 'Wilmington', zip: '19801' }, { name: 'Dover', zip: '19901' }, { name: 'Newark', zip: '19711' }] },
  fl: { code: 'FL', name: 'Florida', topCities: [{ name: 'Miami', zip: '33101' }, { name: 'Orlando', zip: '32801' }, { name: 'Tampa', zip: '33602' }] },
  ga: { code: 'GA', name: 'Georgia', topCities: [{ name: 'Atlanta', zip: '30303' }, { name: 'Savannah', zip: '31401' }, { name: 'Augusta', zip: '30901' }] },
  hi: { code: 'HI', name: 'Hawaii', topCities: [{ name: 'Honolulu', zip: '96813' }, { name: 'Pearl City', zip: '96782' }, { name: 'Hilo', zip: '96720' }] },
  id: { code: 'ID', name: 'Idaho', topCities: [{ name: 'Boise', zip: '83702' }, { name: 'Meridian', zip: '83642' }, { name: 'Nampa', zip: '83651' }] },
  il: { code: 'IL', name: 'Illinois', topCities: [{ name: 'Chicago', zip: '60601' }, { name: 'Aurora', zip: '60505' }, { name: 'Naperville', zip: '60540' }] },
  in: { code: 'IN', name: 'Indiana', topCities: [{ name: 'Indianapolis', zip: '46204' }, { name: 'Fort Wayne', zip: '46802' }, { name: 'Evansville', zip: '47708' }] },
  ia: { code: 'IA', name: 'Iowa', topCities: [{ name: 'Des Moines', zip: '50309' }, { name: 'Cedar Rapids', zip: '52401' }, { name: 'Davenport', zip: '52801' }] },
  ks: { code: 'KS', name: 'Kansas', topCities: [{ name: 'Wichita', zip: '67202' }, { name: 'Overland Park', zip: '66204' }, { name: 'Kansas City', zip: '66101' }] },
  ky: { code: 'KY', name: 'Kentucky', topCities: [{ name: 'Louisville', zip: '40202' }, { name: 'Lexington', zip: '40507' }, { name: 'Bowling Green', zip: '42101' }] },
  la: { code: 'LA', name: 'Louisiana', topCities: [{ name: 'New Orleans', zip: '70112' }, { name: 'Baton Rouge', zip: '70801' }, { name: 'Shreveport', zip: '71101' }] },
  me: { code: 'ME', name: 'Maine', topCities: [{ name: 'Portland', zip: '04101' }, { name: 'Lewiston', zip: '04240' }, { name: 'Bangor', zip: '04401' }] },
  md: { code: 'MD', name: 'Maryland', topCities: [{ name: 'Baltimore', zip: '21201' }, { name: 'Frederick', zip: '21701' }, { name: 'Rockville', zip: '20850' }] },
  ma: { code: 'MA', name: 'Massachusetts', topCities: [{ name: 'Boston', zip: '02108' }, { name: 'Worcester', zip: '01608' }, { name: 'Springfield', zip: '01103' }] },
  mi: { code: 'MI', name: 'Michigan', topCities: [{ name: 'Detroit', zip: '48226' }, { name: 'Grand Rapids', zip: '49503' }, { name: 'Ann Arbor', zip: '48104' }] },
  mn: { code: 'MN', name: 'Minnesota', topCities: [{ name: 'Minneapolis', zip: '55401' }, { name: 'Saint Paul', zip: '55101' }, { name: 'Rochester', zip: '55901' }] },
  ms: { code: 'MS', name: 'Mississippi', topCities: [{ name: 'Jackson', zip: '39201' }, { name: 'Gulfport', zip: '39501' }, { name: 'Hattiesburg', zip: '39401' }] },
  mo: { code: 'MO', name: 'Missouri', topCities: [{ name: 'Kansas City', zip: '64106' }, { name: 'St. Louis', zip: '63101' }, { name: 'Springfield', zip: '65806' }] },
  mt: { code: 'MT', name: 'Montana', topCities: [{ name: 'Billings', zip: '59101' }, { name: 'Missoula', zip: '59801' }, { name: 'Great Falls', zip: '59401' }] },
  ne: { code: 'NE', name: 'Nebraska', topCities: [{ name: 'Omaha', zip: '68102' }, { name: 'Lincoln', zip: '68508' }, { name: 'Bellevue', zip: '68005' }] },
  nv: { code: 'NV', name: 'Nevada', topCities: [{ name: 'Las Vegas', zip: '89101' }, { name: 'Henderson', zip: '89002' }, { name: 'Reno', zip: '89501' }] },
  nh: { code: 'NH', name: 'New Hampshire', topCities: [{ name: 'Manchester', zip: '03101' }, { name: 'Nashua', zip: '03060' }, { name: 'Concord', zip: '03301' }] },
  nj: { code: 'NJ', name: 'New Jersey', topCities: [{ name: 'Newark', zip: '07102' }, { name: 'Jersey City', zip: '07302' }, { name: 'Trenton', zip: '08608' }] },
  nm: { code: 'NM', name: 'New Mexico', topCities: [{ name: 'Albuquerque', zip: '87102' }, { name: 'Las Cruces', zip: '88001' }, { name: 'Santa Fe', zip: '87501' }] },
  ny: { code: 'NY', name: 'New York', topCities: [{ name: 'New York City', zip: '10001' }, { name: 'Buffalo', zip: '14202' }, { name: 'Rochester', zip: '14604' }] },
  nc: { code: 'NC', name: 'North Carolina', topCities: [{ name: 'Charlotte', zip: '28202' }, { name: 'Raleigh', zip: '27601' }, { name: 'Greensboro', zip: '27401' }] },
  nd: { code: 'ND', name: 'North Dakota', topCities: [{ name: 'Fargo', zip: '58102' }, { name: 'Bismarck', zip: '58501' }, { name: 'Grand Forks', zip: '58201' }] },
  oh: { code: 'OH', name: 'Ohio', topCities: [{ name: 'Columbus', zip: '43215' }, { name: 'Cleveland', zip: '44113' }, { name: 'Cincinnati', zip: '45202' }] },
  ok: { code: 'OK', name: 'Oklahoma', topCities: [{ name: 'Oklahoma City', zip: '73102' }, { name: 'Tulsa', zip: '74103' }, { name: 'Norman', zip: '73069' }] },
  or: { code: 'OR', name: 'Oregon', topCities: [{ name: 'Portland', zip: '97201' }, { name: 'Salem', zip: '97301' }, { name: 'Eugene', zip: '97401' }] },
  pa: { code: 'PA', name: 'Pennsylvania', topCities: [{ name: 'Philadelphia', zip: '19102' }, { name: 'Pittsburgh', zip: '15222' }, { name: 'Allentown', zip: '18101' }] },
  ri: { code: 'RI', name: 'Rhode Island', topCities: [{ name: 'Providence', zip: '02903' }, { name: 'Warwick', zip: '02886' }, { name: 'Cranston', zip: '02910' }] },
  sc: { code: 'SC', name: 'South Carolina', topCities: [{ name: 'Charleston', zip: '29401' }, { name: 'Columbia', zip: '29201' }, { name: 'Greenville', zip: '29601' }] },
  sd: { code: 'SD', name: 'South Dakota', topCities: [{ name: 'Sioux Falls', zip: '57104' }, { name: 'Rapid City', zip: '57701' }, { name: 'Aberdeen', zip: '57401' }] },
  tn: { code: 'TN', name: 'Tennessee', topCities: [{ name: 'Nashville', zip: '37203' }, { name: 'Memphis', zip: '38103' }, { name: 'Knoxville', zip: '37902' }] },
  tx: { code: 'TX', name: 'Texas', topCities: [{ name: 'Houston', zip: '77002' }, { name: 'San Antonio', zip: '78205' }, { name: 'Dallas', zip: '75201' }] },
  ut: { code: 'UT', name: 'Utah', topCities: [{ name: 'Salt Lake City', zip: '84101' }, { name: 'West Valley City', zip: '84119' }, { name: 'Provo', zip: '84601' }] },
  vt: { code: 'VT', name: 'Vermont', topCities: [{ name: 'Burlington', zip: '05401' }, { name: 'South Burlington', zip: '05403' }, { name: 'Rutland', zip: '05701' }] },
  va: { code: 'VA', name: 'Virginia', topCities: [{ name: 'Virginia Beach', zip: '23451' }, { name: 'Norfolk', zip: '23510' }, { name: 'Richmond', zip: '23219' }] },
  wa: { code: 'WA', name: 'Washington', topCities: [{ name: 'Seattle', zip: '98101' }, { name: 'Spokane', zip: '99201' }, { name: 'Tacoma', zip: '98402' }] },
  wv: { code: 'WV', name: 'West Virginia', topCities: [{ name: 'Charleston', zip: '25301' }, { name: 'Huntington', zip: '25701' }, { name: 'Morgantown', zip: '26505' }] },
  wi: { code: 'WI', name: 'Wisconsin', topCities: [{ name: 'Milwaukee', zip: '53202' }, { name: 'Madison', zip: '53703' }, { name: 'Green Bay', zip: '54301' }] },
  wy: { code: 'WY', name: 'Wyoming', topCities: [{ name: 'Cheyenne', zip: '82001' }, { name: 'Casper', zip: '82601' }, { name: 'Laramie', zip: '82070' }] },
  dc: { code: 'DC', name: 'District of Columbia', topCities: [{ name: 'Washington', zip: '20001' }, { name: 'Georgetown', zip: '20007' }, { name: 'Capitol Hill', zip: '20003' }] },
}

export const stateList = Object.entries(states).map(([slug, info]) => ({
  slug,
  ...info,
}))
