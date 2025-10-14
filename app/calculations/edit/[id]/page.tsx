'use client'

import { InputField } from "@/components/input-field"
import { SelectField } from "@/components/select-field"
import { box, CalculationForm, delivery, lochstanzlinge, rolls, skillet } from "@/constants/constatns"
import { Api } from "@/services/api-client"
import { Calculation } from "@prisma/client"
import { useParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

export default function Home(){

    const [form, setForm] = useState<CalculationForm>({})
    const { id } = useParams()

    useEffect(() => {
        const fetchCalculation = async (id: number) => {
            
            const calculation = await Api.calculations.getOneCalculation(id)
            setForm(calculation)

        }

        fetchCalculation(Number(id))
    }, [])


    const selectedRoll = rolls.find(r => r.name === form?.roll)
    const selectedMaterial = selectedRoll?.materials.find(m => m.name === form?.material)

    const handleChange = (field: keyof Calculation, value: any) => {
        setForm(prev => prev ? { ...prev, [field]: value } : prev)
    }

    const fetchLine = async (material: string, materialLength: number, lineType: string) => {
        const line = await Api.lines.find({
            material: material,
            lineType: lineType,
            length: materialLength || 0
        });


        const { id } = line

        const processingTime = Number(materialLength) / line.avSpeed;
        const newValuePerRoll = processingTime * line.costPerMin;
        await Api.lines.update(id, { rollLength: String(materialLength), processingTime, valuePerRoll: newValuePerRoll } )
        
        const updatedLine = await Api.lines.getOne(String(id))
        return Number(updatedLine.valuePerRoll)
    }

    const createForm = async (form: CalculationForm) => {
        let materialCost = 0
        let WVPerRoll = 0
        let materialName = undefined

        const { material, materialWidth, materialThickness, materialLength, roll, rollLength, sheetLength, sheetWidth, sheetQuantity, typeOfProduct, skilletFormat, skilletKnife, skilletDensity, totalOrderInRolls, period  } = form
        if(material === 'Baking paper'){
            materialName = 'BP'
        }else{
            materialName = material
        }

        const { density, costPerKg } = await Api.periods.find({
            period: period || "",
            material: material || "",
        })

        if (materialWidth && materialThickness && materialLength && density && material !== 'BP') {
            const materialWeight = materialWidth * materialThickness * materialLength * Number(density) / 1000000
            materialCost = materialWeight * Number(costPerKg)
        }else{
            if(typeOfProduct !== 'Consumer sheets' && materialWidth && rollLength && form.density){
                const square = (materialWidth / 1000) * Number(rollLength)
                const materialWeight = square * form.density
                materialCost = (materialWeight / 1000) * Number(costPerKg)
            }else if (typeOfProduct === 'Consumer sheets' && sheetLength && sheetWidth && sheetQuantity && form.density) {
                const square = Number(sheetWidth) * Number(sheetLength) * sheetQuantity
                const materialWeight = square * form.density
                materialCost = (materialWeight / 1000) * Number(costPerKg)
            }
        }

        if(roll === 'Consumer' && materialWidth && materialWidth <= 350){
            if (material === 'PE' || material === 'PVC') {
                WVPerRoll = await fetchLine('Frischhaltefolie', materialLength || 0, 'Main lines');
            } else {
                WVPerRoll = await fetchLine('Alu', materialLength || 0, 'Main lines');
            }
        }else if(roll === 'Consumer' && materialWidth && materialWidth > 350){
            if (material === 'PE' || material === 'PVC') {
                WVPerRoll = await fetchLine('Frischhaltefolie', materialLength || 0, 'Speed 6,4');
            } else {
                WVPerRoll = await fetchLine('Alu', materialLength || 0, 'Speed 6,4');
            }
        }else if(roll === 'Catering'){
            if (material === 'PE' || material === 'PVC') {
                WVPerRoll = await fetchLine('Frischhaltefolie', materialLength || 0, 'Speed 4,5 and 4,6');
            } else {
                WVPerRoll = await fetchLine('Alu', materialLength || 0, 'Speed 4,5 and 4,6');
            }
        }else if(roll === 'BP' && typeOfProduct !== 'Consumer sheets' && rollLength && Number(rollLength) <=52){
            WVPerRoll = await fetchLine('BP', Number(rollLength) || 0, 'BP lines')
        }else if(roll === 'BP' && typeOfProduct === 'Consumer sheets' && sheetLength && sheetWidth && sheetQuantity){

        let length = 0;

        if(sheetLength > sheetWidth){
            length = Number(sheetLength) * sheetQuantity
        }else{
            length = Number(sheetWidth) * sheetQuantity
        }

        if(length <= 52){
            WVPerRoll = await fetchLine('BP', length, 'BP lines')
        }else{
            WVPerRoll = 0
        }

        }else if(roll === 'BP' && rollLength && Number(rollLength) > 52){
            WVPerRoll = 0
        }

        const skillet = await Api.skillets.find({
            format: Number(skilletFormat),
            knife: skilletKnife || '',
            density: Number(skilletDensity)
        })

        let skilletName = '';
        let skilletPrice = 0;

        if(totalOrderInRolls && totalOrderInRolls > 30000 && totalOrderInRolls <= 200000){
            skilletName = skillet.smallDescription;
            skilletPrice = skillet.smallPrice
        }else if(totalOrderInRolls && totalOrderInRolls > 200000 && totalOrderInRolls <= 500000){
            skilletName = skillet.mediumDescription;
            skilletPrice = skillet.mediumPrice
        }else if(totalOrderInRolls && totalOrderInRolls > 500000 && totalOrderInRolls <= 1000000){
            skilletName = skillet.largeDescription;
            skilletPrice = skillet.largePrice
        }

        const core = await Api.cores.find({ length: materialWidth || 0, type: roll || '' })
        
        let coreName = `Hülse ${core.length} x ${core.width} x ${core.thickness} mm`
        let corePrice = core.price;

        if(core.type === 'No suitable core found'){
            coreName = 'No suitable core found'
        }
        
        if(material === 'Baking paper'){
            coreName = '-'
            corePrice = 0
        }

        return { materialCost, WVPerRoll, skilletPrice, skillet: skilletName, corePrice, core: coreName }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        const { id, createdAt, updatedAt, ...cleanForm } = form as any
        
        const props = await createForm(cleanForm)

        await Api.calculations.update(id, { ...cleanForm, ...props })
        setForm({})
        toast.success('Calculation edited!')
    
    }

    useEffect(() => {
        if (form.totalOrderInRolls && form.cartonPerPallet && form.rollsPerCarton) {
            const result = form.totalOrderInRolls / form.cartonPerPallet / form.rollsPerCarton
            setForm(prev => ({ ...prev, totalOrderInPallets: result }))
        }
    }, [form.totalOrderInRolls, form.cartonPerPallet, form.rollsPerCarton])

    useEffect(() => {
        if (form.deliveryConditions === "EXW" || form.deliveryConditions === "FCA") {
            setForm(prev => ({ ...prev, deliveryAddress: "Singen" }))
        } else if (form.deliveryConditions === "DDP" || form.deliveryConditions === "DAP") {
            setForm(prev => ({ ...prev, deliveryAddress: "" }))
        }
    }, [form.deliveryConditions])
    
    return(
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-6">
            <form
                className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl mx-auto"
                onSubmit={handleSubmit}
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Calculation edit
                </h2>

                <div className="grid gap-4">
                    {/* Назва */}
                    <InputField label="Title" type="string" value={form?.title || ""} onChange={(e) => handleChange("title", e.target.value)} />

                    {/* Creator */}
                    <InputField label="Creator (your email)" type="email" value={form?.creator || ""} onChange={(e) => handleChange("creator", e.target.value)} />

                    {/* Roll */}
                    <SelectField label="Roll type" value={form?.roll || ""} onChange={(e) => handleChange("roll", e.target.value)}>
                        <option value="">-- choose roll type --</option>
                        {rolls.map((r, i) => (
                            <option key={i} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </SelectField>

                    {/* Матеріал */}
                    {selectedRoll && (
                        <SelectField label="Material" value={form?.material || ""} onChange={(e) => handleChange("material", e.target.value)}>
                        <option value="">-- choose material --</option>
                        {selectedRoll.materials.map((m) => (
                            <option key={m.id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                        </SelectField>
                    )}

                    {/* Ширина */}
                    <SelectField
                        label="Width (mm)"
                        value={form?.materialWidth || ""}
                        onChange={(e) => handleChange("materialWidth", Number(e.target.value))}
                        disabled={!selectedMaterial}
                    >
                        <option value="">-- choose width --</option>
                        {selectedMaterial?.width?.map((w, i) => (
                            <option key={i} value={w}>
                                {w}
                            </option>
                        ))}
                    </SelectField>

                    {selectedMaterial?.name !== 'Baking paper' && (
                        <>
                            {/* Товщина */}
                            <SelectField
                                label="Thickness (my)"
                                value={form?.materialThickness || ""}
                                onChange={(e) => handleChange("materialThickness", Number(e.target.value))}
                                disabled={!selectedMaterial}
                            >
                                <option value="">-- choose thickness --</option>
                                {selectedMaterial?.thickness?.map((t, i) => (
                                    <option key={i} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </SelectField>

                            {/* Довжина */}
                            <InputField label="Length (m)" type="number" value={form?.materialLength || ""} onChange={(e) => handleChange("materialLength", Number(e.target.value))} />
                        </>
                    )}

                    {selectedMaterial?.name === 'Baking paper' && (
                        <>
                            {/* Density */}
                            <SelectField
                                label="Density (g/m²)"
                                value={form?.density || ""}
                                onChange={(e) => handleChange("density", Number(e.target.value))}
                                disabled={!selectedMaterial}
                            >
                                <option value="">-- choose density --</option>
                                {selectedMaterial?.density?.map((d, i) => (
                                    <option key={i} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </SelectField>

                            {/* Type of product */}
                            <SelectField
                                label="Type of product"
                                value={form?.typeOfProduct || ""}
                                onChange={(e) => handleChange("typeOfProduct", e.target.value)}
                                disabled={!selectedMaterial}
                            >
                                <option value="">-- choose type of product --</option>
                                {selectedMaterial?.typeOfProduct?.map((t, i) => (
                                    <option key={i} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </SelectField>
                        </>
                    )}
                    { (form?.typeOfProduct === 'Consumer sheets' && form?.material === 'Baking paper') && (
                        <>
                            {/* Sheet width */}
                            <InputField
                                label="Sheet width(m)"
                                type="string"
                                value={form?.sheetWidth || ""}
                                onChange={(e) => handleChange("sheetWidth", e.target.value)}
                            />

                            {/* Sheet length */}
                            <InputField
                                label="Sheet length(m)"
                                type="string"
                                value={form?.sheetLength || ""}
                                onChange={(e) => handleChange("sheetLength", e.target.value)}
                            />

                            {/* Sheet quantity */}
                            <InputField
                                label="Sheet quantity (max 30)"
                                type="number"
                                max={30}
                                value={form?.sheetQuantity || ""}
                                onChange={(e) => handleChange("sheetQuantity", Number(e.target.value))}
                            />
                        </>
                    )}
                    {(form?.typeOfProduct === 'Consumer roll' || form?.typeOfProduct === 'Catering roll'  && form?.material === 'Baking paper') && (
                        <>
                            {/* Roll length */}
                            <InputField
                                label="Roll length(m)"
                                type="string" value={form?.rollLength || ""}
                                onChange={(e) => handleChange("rollLength", e.target.value)}
                            />
                        </>
                    )}

                    {/* Колір */}
                    <SelectField
                        label={selectedRoll?.name === 'BP' ? 'Paper color' : 'Color'}
                        value={form?.materialColor || ""}
                        onChange={(e) => handleChange("materialColor", e.target.value)}
                        disabled={!selectedMaterial}
                    >
                        <option value="">-- choose color --</option>
                        {selectedMaterial?.color?.map((c, i) => (
                            <option key={i} value={c}>
                                {c}
                            </option>
                        ))}
                    </SelectField>

                    {/* Інші властивості */}
                    <SelectField
                        label="Other properties"
                        value={form?.otherProperties || ""}
                        onChange={(e) => handleChange("otherProperties", e.target.value)}
                        disabled={!selectedMaterial}
                    >
                        <option value="">-- choose other properties --</option>
                        {selectedMaterial?.otherProperties?.map((o, i) => (
                            <option key={i} value={o}>
                                {o}
                            </option>
                        ))}
                    </SelectField>

                    {/* Skillet format */}
                    <SelectField label="Skillet format" value={form?.skilletFormat || ""} onChange={(e) => handleChange("skilletFormat", String(e.target.value))}>
                        <option value="">-- choose skillet form?at --</option>
                        {(() => {
                            let formats: string[] = skillet.format;

                            if (selectedRoll?.name === "BP") {
                                formats = skillet.format.slice(4, 8);
                            } else if (selectedRoll?.name === "Catering") {
                                formats = skillet.format.slice(7, 9);
                            } else {
                                formats = skillet.format.slice(0, 4);
                            }

                            return formats.map((f, i) => (
                                <option key={i} value={f}>
                                    {f}
                                </option>
                            ));
                        })()}
                    </SelectField>

                    {/* Skillet knife */}
                    <SelectField
                        label="Skillet knife"
                        value={form?.skilletKnife || ""}
                        onChange={(e) => handleChange("skilletKnife", e.target.value)}
                    >
                        <option value="">-- choose skillet knife --</option>
                        {(
                        selectedRoll?.name === "BP"
                            ? [skillet.knife[0], ...skillet.knife.slice(-3)]
                            : selectedRoll?.name === "Catering"
                            ? [skillet.knife[0], ...skillet.knife.slice(-2)]
                            : skillet.knife.slice(0, 5)
                        ).map((k, i) => (
                            <option key={i} value={k}>
                                {k}
                            </option>
                        ))}
                    </SelectField>

                    {selectedRoll?.name === "Catering" ?
                        <>
                            {/* Lochstanzlinge */}
                                <SelectField label="Lochstanzlinge" value={form?.lochstanzlinge || ""} onChange={(e) => handleChange("lochstanzlinge", e.target.value)}>
                                <option value="">-- choose lochstanzlinge --</option>
                                {lochstanzlinge.map((l, i) => (
                                    <option key={i} value={l}>
                                        {l}
                                    </option>
                                ))}
                                </SelectField>
                        </>
                    : (
                        <>
                            {/* Skillet density */}
                            <SelectField label="Skillet density" value={form?.skilletDensity || ""} onChange={(e) => handleChange("skilletDensity", Number(e.target.value))}>
                                <option value="">-- choose skillet density --</option>
                                {skillet.density.map((d, i) => (
                                    <option key={i} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </SelectField>
                        </>
                    )}

                    {/* Box */}
                    <SelectField label="Box type" value={form?.boxType || ""} onChange={(e) => handleChange("boxType", e.target.value)}>
                        <option value="">-- choose box type --</option>
                        {box.type.map((t, i) => (
                            <option key={i} value={t}>
                                {t}
                            </option>
                        ))}
                    </SelectField>

                    {/* Колір коробки */}
                    <SelectField label="Box color" value={form?.boxColor || ""} onChange={(e) => handleChange("boxColor", e.target.value)}>
                        <option value="">-- choose box color --</option>
                        {box.color.map((c, i) => (
                            <option key={i} value={c}>
                                {c}
                            </option>
                        ))}
                    </SelectField>

                    {/* Друк коробки */}
                    <SelectField label="Box print" value={form?.boxPrint || ""} onChange={(e) => handleChange("boxPrint", e.target.value)}>
                        <option value="">-- choose box print --</option>
                        {(selectedRoll?.name === "BP" 
                            ? box.print.slice(0, -1)
                            : box.print
                        ).map((p, i) => (
                            <option key={i} value={p}>
                                {p}
                            </option>
                        ))}
                    </SelectField>

                    {/* Execution коробки */}
                    <SelectField label="Box execution" value={form?.boxExecution || ""} onChange={(e) => handleChange("boxExecution", e.target.value)}>
                        <option value="">-- choose box execution --</option>
                        {box.execution.map((ex, i) => (
                            <option key={i} value={ex}>
                                {ex}
                            </option>
                        ))}
                    </SelectField>

                    {/* Rolls per carton */}
                    <InputField label="Rolls per carton" type="number" value={form?.rollsPerCarton || ""} onChange={(e) => handleChange("rollsPerCarton", Number(e.target.value))} />

                    {/* Antislide paper sheets */}
                    <SelectField label="Antislide paper sheets" value={form?.antislidePaperSheets || ""} onChange={(e) => handleChange("antislidePaperSheets", e.target.value)}>
                        <option value="">-- choose antislide paper sheets --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </SelectField>

                    {/* Carton per pallet */}
                    <InputField label="Carton per pallet" type="number" value={form?.cartonPerPallet || ""} onChange={(e) => handleChange("cartonPerPallet", Number(e.target.value))} />

                    {/* Total order in rolls */}
                    <InputField label="Total order in rolls" type="number" value={form?.totalOrderInRolls || ""} onChange={(e) => handleChange("totalOrderInRolls", Number(e.target.value))} />

                    {/* Total order in pallets */}
                    {form?.totalOrderInPallets !== undefined && (
                        <div className="flex items-center justify-between gap-4 mt-2">
                            <p>Total order in pallets</p>
                            <p>{form?.totalOrderInPallets}</p>
                        </div>
                    )}

                    {/* Період */}
                    <InputField label="Period" type="string" value={form?.period || ""} onChange={(e) => handleChange("period", e.target.value)} />

                    {/* Умови доставки */}
                    <SelectField label="Delivery conditions" value={form?.deliveryConditions || ""} onChange={(e) => handleChange("deliveryConditions", e.target.value)}>
                        <option value="">-- choose delivery conditions --</option>
                        {delivery.type.map((d, i) => (
                            <option key={i} value={d}>
                                {d}
                            </option>
                        ))}
                    </SelectField>

                    {/* Адреса доставки */}
                    <InputField
                        label="Delivery address"
                        type="string"
                        value={form?.deliveryAddress || ""}
                        onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                        disabled={form?.deliveryConditions === "EXW" || form?.deliveryConditions === "FCA"}
                    />

                    {/* Reference article */}
                    <InputField label="Reference article" type="string" value={form?.referenceArticle || ""} onChange={(e) => handleChange("referenceArticle", e.target.value)} required={false} />

                    {/* Remarks */}
                    <InputField label="Remarks" type="string" value={form?.remarks || ""} onChange={(e) => handleChange("remarks", e.target.value)} required={false} />
                        
                </div>

                <div className="flex justify-center gap-5">
                    <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                        Edit calculation
                    </button>
                </div>
            </form>

            <ToastContainer />
        </div>

    )
}