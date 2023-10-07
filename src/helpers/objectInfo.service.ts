import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class ObjectInfoService {
    async getObjectInfoRecursive(url: string) {
        function deleteUselessProperties(object) {
            delete object.films
            delete object.species
            delete object.vehicles
            delete object.starships
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
}