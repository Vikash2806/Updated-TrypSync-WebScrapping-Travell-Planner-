"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  Input,
  Button,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
// import { apiClient } from "@/lib";
import { ADMIN_API_ROUTES } from "@/utils/api-routes";
import axios from "axios";
import ScrapingQueue from "@/components/admin/scraping-queue/scraping-queue";
import { CurrentlyScrapingTable } from "./components/currently-scraping-table";


const ScrapeTrips = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState<undefined | string>(
    undefined
  );
  const [jobs, setJobs] = useState([]);

 const searchCities = async (searchQuery: string) => {
    try {
        const response = await axios.get(
            `https://secure.geonames.org/searchJSON?q=${searchQuery}&maxRows=5&username=kishan&style=SHORT`
        );

        const parsed = response.data;
        if (parsed?.geonames?.length > 0) {
            const uniqueCities = [...new Set(parsed.geonames.map((city: { name: string }) => city.name))];
            setCities(uniqueCities);
        } else {
            setCities([]);
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
    }
};


  const startScraping = async () => {
    await axios.post(ADMIN_API_ROUTES.CREATE_JOB, {
      url:
        "https://packages.yatra.com/holidays/intl/search.htm?destination=" +
        selectedCity,
      jobType: { type: "location" },
    });
  };

  useEffect(() => {
    const getData = async () => {
      const data = await axios.get(ADMIN_API_ROUTES.JOB_DETAILS);
      setJobs(data.data.jobs);
    };
    const interval = setInterval(() => getData(), 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="m-10 grid grid-cols-3 gap-5">
      <Card className="col-span-2 bg-white">
        <CardBody>
          <Tabs>
            <Tab key="lcoation" title="Location">
              <Input
                type="text"
                label="Search for a Location"
                onChange={(e) => searchCities(e.target.value)}
              />

              <div className="w-full min-h-[200px] max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mt-5">
                <Listbox
                  aria-label="Actions"
                  onAction={(key) => setSelectedCity(key as string)}
                >
                  {cities.map((city) => (
                    <ListboxItem
                      key={city}
                      color="primary"
                      className="text-primary-500"
                    >
                      {city}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            </Tab>
            <Tab key="url" title="Flights">
              <Card>
                <CardBody>
                  <Input
                    type="text"
                    label="Scrape data for a specific URL"
                    // onChange={(e) => searchCities(e.target.value)}
                  />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="id" title="Hotels">
              <Card>
                <CardBody>
                  <Input
                    type="text"
                    label="Search data for a specific trip package using package ID.  "
                    // onChange={(e) => searchCities(e.target.value)}
                  />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter className="flex flex-col gap-5 ">
          <div>
            {selectedCity && (
              <h1 className="text-xl text-gray-500">Scrape data for {selectedCity}</h1>
            )}
          </div>
          <Button
            onClick={startScraping}
            size="lg"
            className="w-full bg-gray-700  text-white hover:bg-gray-700"
            
          >
            Scrape
          </Button>
        </CardFooter>
      </Card>
      <ScrapingQueue />
      <div className="col-span-3">
        <CurrentlyScrapingTable jobs={jobs} />
      </div>
    </section>
  );
};

export default ScrapeTrips;
