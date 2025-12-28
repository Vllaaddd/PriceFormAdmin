export const rolls = [
    {
        name: 'Consumer',
        materials: [
            {
                name: 'Alu',
                width: [288, 290, 294, 295, 298, 300, 327, 330],
                thickness: [8, 9, 10, 10.3, 10.5, 10.7, 11, 11.2, 11.3, 11.5, 12, 12.3, 12.5, 13, 13.2, 13.3, 13.5, 14, 14.5, 15, 15.5, 17, 17.5, 18, 20],
                color: ['Silver', 'Not relevant'],
                otherProperties: ['Embossed', 'Not relevant'],
                id: 1,
            },
            {
                name: 'PE',
                width: [290, 295, 300],
                thickness: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13.5, 14, 14.5],
                color: ['Transparent', 'Not relevant'],
                otherProperties: ['SuperStretch', 'Easy Tear'],
                id: 2,
            },
            {
                name: 'PVC',
                width: [290, 295, 300, 350],
                thickness: [6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 10.2],
                color: ['Pink', 'Champagner', 'Neutral'],
                otherProperties: ['Factor 1', 'Factor 2', 'Factor 3'],
                id: 3,
            },
        ]
    },
    {
        name: 'BP',
        materials: [
            {
                name: 'Baking paper',
                width: [300, 330, 360, 380, 430, 450],
                color: ['White', 'Brown'],
                otherProperties: ['Printed', 'Not relevant'],
                density: [35, 37, 39, 41],
                typeOfProduct: ['Consumer roll', 'Consumer sheets', 'Catering roll'],
                id: 4,
            }
        ]
    },
    {
        name: 'Catering',
        materials: [
            {
                name: 'Alu',
                width: [288, 290, 294, 295, 298, 300, 440, 450],
                thickness: [8, 9, 10, 10.3, 10.5, 10.7, 11, 11.2, 11.3, 11.5, 12, 12.3, 12.5, 13, 13.2, 13.3, 13.5, 14, 14,2, 14,3, 14.5, 15, 15.5, 17, 17.2, 17.5, 18, 20, 35, 45],
                color: ['Silver'],
                otherProperties: ['Embossed', '-'],
                id: 1,
            },
            {
                name: 'PE',
                width: [290, 295, 300, 440, 450],
                thickness: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13.5, 14, 14.5],
                color: ['Transparent'],
                otherProperties: ['SuperStretch', 'Easy Tear'],
                id: 2,
            },
            {
                name: 'PVC',
                width: [290, 295, 300, 350, 440, 450],
                thickness: [6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 10.2],
                color: ['Pink', 'Champagner', 'Neutral'],
                otherProperties: ['Factor 1', 'Factor 2', 'Factor 3'],
                id: 3,
            },
        ]
    },
]

export const skillet = {
    format: ['39', '45', '50', '52', '45', '60', '90', 'Without skillet/lose', '90/Minibox'],
    knife: ['With knife', 'Without knife'],
    density: [275, 350, 375, 400],
};

export const box = {
    type: ['With cover', 'Without cover', 'Display', 'Export carton box'],
    color: ['Brown', 'Printed in colors'],
    print: ['Printed', 'Not printed', 'Only barcode printed 2 sides', 'Only barcode printed 4 sides', 'Printed and varnished'],
    execution: ['With perforation', 'Without perforation'],
};

export const delivery = {
    type: ['EXW', 'FCA', 'DAP', 'DDP'],
};

export const lochstanzlinge = [
    'Lochstanzlinge 81 x 81 braun für Miniboxen',
    'Lochstanzlinge 81 x 81 braun Ø 50 mm für Miniboxen',
    'Lochstanzlinge 88 x 100 mm (schräge EB)',
    'Lochstanzlinge 97 x 97 mm (gerade EB)',
    'Stanzlinge EB Weita mit Slider-Aussparung',
    'Plastikseitenteile EB',
    'Plastikseitenteile EB 10x10cm'
]

export type CalculationForm = {
    creator?: string | null
    title?: string | null
    roll?: string | null
    material?: string | null
    materialWidth?: number | null
    materialThickness?: number | null
    materialLength?: number | null
    materialColor?: string | null
    otherProperties?: string | null
    skilletFormat?: string | null
    skilletKnife?: string | null
    skilletDensity?: number | null
    boxType?: string | null
    boxColor?: string | null
    boxPrint?: string | null
    boxExecution?: string | null
    lochstanzlinge?: string | null
    rollsPerCarton?: number | null
    antislidePaperSheets?: string | null
    cartonPerPallet?: number | null
    totalOrderInRolls?: number | null
    totalOrderInPallets?: number | null
    period?: string | null
    deliveryConditions?: string | null
    deliveryAddress?: string | null
    referenceArticle?: string | null
    remarks?: string | null
    density?: number | null
    typeOfProduct?: string | null
    rollLength?: string | null
    sheetWidth?: string | null
    sheetLength?: string | null
    sheetQuantity?: number | null
}