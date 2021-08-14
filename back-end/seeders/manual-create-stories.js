require('dotenv').config();
let { Story, Project } = require('../models');

let createProjectStories = async function(projectStoriesObj) {
    try {
        let foundProject = await Project.findOne({where: {
            name: projectStoriesObj.name
        }});

        for(let story of projectStoriesObj.stories) {
            try {
                await Story.create({
                    name: story.name,
                    description: story.description,
                    acceptanceTests: story.acceptanceTests,
                    priority: story.priority,
                    sizePts: story.sizePts,
                    businessValue: story.businessValue,
                    idProject: foundProject.id
                });
            }
            catch(err) {
                console.error(err);
            }
        }
    }
    catch(err) {
        console.error(err);
    }
}

let projects = [
    {
        name: 'Projekt skupine 5',
        stories: [
            {
                name: 'Prijava v sistem',
                acceptanceTests: '### Preveri regularen potek',
                priority: 'must have',
                businessValue: 10,
                sizePts: 2.5
            },
            {
                name: 'Registracija uporabnika',
                description: 'Administrator sistema lahko registrira novega uporabnika',
                acceptanceTests: '### Preveri regularen potek\n### Preveri, da je registracija dovoljena samo administratorju\n### Preveri podvojen e-poštni naslov',
                priority: 'must have',
                businessValue: 10,
                sizePts: 4
            },
            {
                name: 'Spreminjanje lastnih uporabniških podatkov',
                description: 'Uporabnik sistema lahko za svoj uporabniški račun spreminja uporabniško ime, geslo in druge osebne podatke.',
                acceptanceTests: '### Preveri spremembo uporabniškega imena in morebitno podvajanje.\n### Preveri spremembo gesla.\n### Preveri spremembo drugih osebnih podatkov.',
                priority: 'could have',
                businessValue: 20,
                sizePts: 3
            },
            {
                name: 'Urejanje in brisanje uporabniških zgodb',
                description: 'Produktni vodja in skrbnik metodologije lahko urejata in brišeta tiste uporabniške zgodbe v projektu, ki še niso realizirane in niso dodeljene nobenemu Sprintu.',
                acceptanceTests: '### Preveri regularen potek.\n### Preveri za zgodbo, ki je že bila dodeljena nekemu Sprintu.\n### Preveri za zgodbo, ki je že bila realizirana.\n### Preveri podvajanje pri spremembi imena uporabniške zgodbe.',
                priority: 'should have',
                businessValue: 30,
                sizePts: 3
            },
            {
                name: 'Vzdrževanje obstoječih nalog',
                description: 'Skrbnik metodologije in člani razvojne skupine lahko urejajo vse parametre in brišejo obstoječe naloge (tasks) pri posameznih uporabniških zgodbah.',
                acceptanceTests: '### Preveri regularen potek.\n### *Preveri brisanje naloge, ki jo je nek razvijalec že sprejel.',
                priority: 'should have',
                businessValue: 15
            },
            {
                name: 'Vzdrževanje uporabniške dokumentacije (Could have)',
                description: 'Vsi sodelujoči na projektu lahko urejajo uporabniško dokumentacijo za projekt. Lahko jo tudi uvozijo ali izvozijo v nek standarden besedilni format.',
                acceptanceTests: '### Preveri urejanje dokumentacije.\n### Preveri pravilen uvoz podatkov.\n### Preveri izvoz dokumentacije.',
                priority: 'could have',
                businessValue: 25
            }
        ]
    },
    {
        name: 'Drugi tir',
        stories: [
            {
                name: 'Referendum',
                acceptanceTests: '### Zadostna udeležba, da bojo veljavni rezultati referenduma',
                priority: 'must have',
                businessValue: 8
            },
            {
                name: 'Referendum: Chapter 2',
                acceptanceTests: '### Preveri, če vlada še stoji',
                priority: 'must have',
                businessValue: 7
            },
            {
                name: 'Nabavi maketo',
                acceptanceTests: '### Preveri, da se zgodba znajde v medijih',
                priority: 'should have',
                businessValue: 10
            },
            {
                name: 'Naredi dokumentacijo',
                acceptanceTests: '### Preveri, da je dolžina dokumentacije vsaj 400 strani',
                priority: 'could have',
                businessValue: 100
            },
            {
                name: 'Nabavi zakusko za pogostitev ob podpisu pogodb',
                acceptanceTests: '### Preveri, da je bil prej vsaj en mesec objavljen razpis',
                priority: 'must have',
                businessValue: 1000
            }
        ]
    },
    {
        name: 'Manhattan project',
        stories: []
    },
    {
        name: 'Half-Life 4',
        stories: [
            {
                name: 'Popravi znane napake v Source Engine',
                acceptanceTests: '### Preveri, da se igra ne sesuje ob pritisku WASD',
                priority: 'must have',
                businessValue: 20
            },
            {
                name: 'Prijava v sistem',
                acceptanceTests: '### Preveri regularen potek\n### Preveri na počasnem računalniku, ki podpira 2 barvi',
                priority: 'won\'t have this time',
                businessValue: 10
            },
            {
                name: 'Zasnova uvodne misije',
                acceptanceTests: '### Preveri, da se zgodba povezuje s prejšnjo izdajo\n### Pretestiraj vse težavnosti (razvijalec)\n### Pretestiraj vse težavnosti (alpha tester)',
                priority: 'must have',
                businessValue: 50
            }
        ]
    }
];

(async () => {
    try {
        for(let currProj of projects) {
            console.log(`"**Creating stories for project ${currProj.name}**`);
            await createProjectStories(currProj);
        }
    } 
    catch(err) {
        console.log("**FAILED**");
        console.error(err);
    }
})();