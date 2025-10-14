import axios from "axios";



export const getCveId = async (cveID) => {
  try {
    const res = await axios.get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");

    const data = res.data.vulnerabilities;

    let CVEID = [];

    for (let item of data) {
      CVEID.push(item.cveID);
    };

    const filter = CVEID.filter((item) => item === cveID);

    return filter.length > 0;

  } catch (error) {
    console.log(error);
    return null;
  }
};

export const ExploitDetails = async (cveID) => {
  try {
    const res = await axios.get(`https://kevin.gtfkd.com/kev/${cveID}`);
    return res.data.githubPocs;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const EPSS = async (cveID) => {
  try {
    const res = await axios.get(`https://api.first.org/data/v1/epss?cve=${cveID}`);
    return res.data?.data[0]?.epss;
  } catch (error) {
    console.log(error);
    return null;
  }
};