import { Injectable } from '@nestjs/common';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { Character } from 'types/tables';

@Injectable()
export class CharactersService {
    async getAll(page: number, search: string) {
        const objectInfoService = new ObjectInfoService();
        if (!page) page = 1;
        const searchFilter = search ? `&search=${search}` : "";
        let { data: response } = await objectInfoService.getObjectInfo(`https://swapi.dev/api/people?page=${page}${searchFilter}`);
        response.total_records = response.count;
        response.row_count = response.results.length;
        response.page = +page;

        delete response.next;
        delete response.count;
        delete response.previous;

        let records = response.results

        response.results.forEach((element: Character) => {
            delete element.species;
            delete element.films;
        });

        const [uniqueUrls, nestedObjectsReference] = objectInfoService.returnNestedObjectsReferenceAndUrls(records);

        const uniqueUrlsArray = Array.from(uniqueUrls);

        const nestedObjectsResponse = await Promise.all(uniqueUrlsArray.map((url: string) => objectInfoService.getObjectInfo(url))).then((responses) => responses.map((response) => response.data));
        objectInfoService.deleteNestedObjectsOfArrayResponse(nestedObjectsResponse);
        objectInfoService.mapObjectWithUrl(nestedObjectsReference, nestedObjectsResponse);

        return response;
    }
}
