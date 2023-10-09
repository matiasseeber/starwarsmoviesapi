import { Injectable } from '@nestjs/common';
import axios from 'axios';

const availableUrls = [
    "https://swapi.dev/api/people/",
    "https://swapi.dev/api/planets/",
    "https://swapi.dev/api/vehicles/",
    "https://swapi.dev/api/starships/"
];

@Injectable()
export class ObjectInfoService {
    async getObjectInfoRecursive(url: string) {
        function deleteUselessProperties(object) {
            delete object.films
            delete object.species
            delete object.residents
            delete object.pilots
        }
        try {
            console.log(url)
            const response = await axios.get(url, {
                headers: {
                    Accept: "application/json"
                }
            });
            let data = response.data;
            delete data.films
            // Fetch and attach data for nested objects
            const nestedObjectPromises = await Promise.all(
                //only query root properties that are a url or nested objects that have urls inside
                Object.entries(data).filter(([key, value]) => {
                    return Array.isArray(value)
                        || typeof value === 'string' && value.startsWith('http') && key != "url"
                }).map(async ([key, value]) => {
                    if (Array.isArray(value)) {
                        // Handle arrays
                        const nestedResponse = await Promise.all(value.map(async (nestedUrl) => {
                            const nestedResponse = await axios.get(nestedUrl);
                            return nestedResponse.data;
                        }));
                        data[key] = nestedResponse;
                        return nestedResponse;
                    } else if (typeof value === 'string' && value.startsWith('http')) {
                        // Handle single (example: homeworld for characters)
                        const { data: nestedResponse } = await axios.get(value);
                        data[key] = nestedResponse;
                        return nestedResponse;
                    }
                })
            );

            //delete all useless properties for nested objects and nested arrays
            nestedObjectPromises.forEach((object) => {
                if (Array.isArray(object))
                    object.forEach((item) => deleteUselessProperties(item))
                else
                    deleteUselessProperties(object)
            })

            return data;
        } catch (error) {
            console.error('Error fetching object info:', error);
            throw error;
        }
    }
    async getObjectInfo(url: string) {
        return axios.get(url);
    }
    deleteNestedObjectsOfArrayResponse(array: any[]) {
        array.forEach(((response: any) => {
            this.deleteNestedObjects(response);
        }));
    }
    deleteNestedObjects(object: any) {
        const keys = Object.keys(object);
        const keysToDelete = keys.filter((key: string) => Array.isArray(object[key]));
        for (let i = 0; i < keysToDelete.length; i++) {
            delete object[keysToDelete[i]];
        }
    }
    returnNestedObjectsReferenceAndUrls(array: any[]): [Set<string>, any[]] {
        function ArrayItemsToObjects(array: any[]) {
            array.forEach((item, index, arr) => {
                if (typeof item === "string") {
                    arr[index] = { url: item };
                }
            });
            return array;
        }
        let uniqueUrls = new Set<string>();
        let nestedObjectsReference = [];
        array.forEach((object) => {
            if (object.vehicles) nestedObjectsReference = nestedObjectsReference.concat(ArrayItemsToObjects(object.vehicles));
            if (object.starships) nestedObjectsReference = nestedObjectsReference.concat(ArrayItemsToObjects(object.starships));
            if (object.planets) nestedObjectsReference = nestedObjectsReference.concat(ArrayItemsToObjects(object.planets));
            if (object.characters) nestedObjectsReference = nestedObjectsReference.concat(ArrayItemsToObjects(object.characters));
            if (object.homeworld) {
                object.homeworld = {
                    url: object.homeworld
                }
                nestedObjectsReference = nestedObjectsReference.concat(object.homeworld);
            }
            Object.values(object).forEach(value => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(subItem => {
                            if (subItem.url) {
                                uniqueUrls.add(subItem.url);
                            } else if (typeof subItem === "string" && subItem.includes("https://")) {
                                uniqueUrls.add(subItem);
                            }
                        });
                    } else if (typeof value === "string" && value.includes("https://")) {
                        uniqueUrls.add(value);
                    } else if (typeof value === "object" && (value as { url: string }).url) {
                        uniqueUrls.add((value as { url: string }).url);
                    }
                }
            });
        });
        return [uniqueUrls, nestedObjectsReference];
    }
    mapObjectWithUrl(nestedObjectsReference: any[], nestedObjectsResponse: any[]) {
        for (let i = 0; i < nestedObjectsReference.length; i++) {
            const object = nestedObjectsReference[i];
            const referencedObject = nestedObjectsResponse.find((item) => item.url == object.url);
            delete object.url;
            object.data = referencedObject;

        }
    }
    areUrlsValid(urls: string[]): [boolean, object] {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            let isUrlValid = false;
            availableUrls.forEach((item: string) => {
                if (url.includes(item)) isUrlValid = true;
            });
            if (!isUrlValid) {
                return [
                    false,
                    {
                        msg: `${url} is not valid`,
                        valid_urls: availableUrls.map((item) => item + ":id")
                    }
                ];
            }
        }
        return [
            true,
            undefined
        ];
    }
}