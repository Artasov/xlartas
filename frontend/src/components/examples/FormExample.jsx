import React, {useState} from 'react';
import InputText from '../base/elements/form/InputText/InputText';
import InputSelect from '../base/elements/form/InputSelect/InputSelect';
import InputFile from '../base/elements/form/InputFile/InputFile';
import InputNumber from "../base/elements/form/InputNumber/InputNumber";
import InputCheckBox from "../base/elements/form/InputCheckBox/InputCheckBox";
import InputRadioGroup from "../base/elements/form/InputRadioGroup/InputRadioGroup";

const FormExample = () => {
    const [inputText, setInputText] = useState('');
    const [inputNumber, setInputNumber] = useState(0);
    const [selectValue, setSelectValue] = useState('');

    // Логика обработки и прочие функции

    return (
        <form className={'mx-auto frc gap-3 px-3 w-100 flex-wrap'} style={{maxWidth: 750}}>
            <div className={'fcc gap-3'} style={{maxWidth: 330}}>
                <InputText
                    name="username"
                    label="Username"
                    type="text"
                    helpText="Enter something about your password"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className={'fs-6'}
                />
                <div className={'frc align-items-end gap-3 flex-wrap'}>
                    <InputNumber
                        name="experience"
                        label="Experience years"
                        type="number"
                        helpText="How many years of experience do you have?"
                        value={1}
                        step={1}
                        onChange={e => setInputNumber(e.target.value)}
                        className={'fs-6'}
                    />
                    <InputFile
                        name="avatar"
                        maxFileSize={1000000} // 1 МБ
                        required={true}
                        label={'+ Ava'}
                        helpText={''}
                        size={'small'}
                        className={'fs-6'}
                    />
                </div>
                <div className={'frc align-items-end gap-3 flex-wrap'}>
                    <InputSelect
                        name="country"
                        label="Country"
                        defaultOptionIndex={1}
                        helpText="Choose your country."
                        onChange={e => setSelectValue(e.target.value)}
                        options={['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil']}
                        className={'fs-6'}
                    />
                    <InputSelect
                        name="main_language"
                        label=""
                        defaultOptionIndex={0}
                        helpText="Select ur best language."
                        onChange={e => setSelectValue(e.target.value)}
                        options={['Python', 'JavaScript', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'Swift', 'Kotlin', 'PHP']}
                        className={'fs-6'}
                    />
                </div>

                <div className={'frc gap-3 flex-wrap'}>
                    <InputCheckBox
                        name="remote"
                        label="Remote"
                        defaultValue={1}
                        className={'fs-6 flex-row-reverse'}
                    />
                    <InputCheckBox
                        name="office"
                        label="Office"
                        defaultValue={0}
                        className={'fs-6'}
                    />
                </div>
            </div>
            <div className={'fcc gap-3'} style={{maxWidth: 330}}>
                <div className={'frc justify-content-between gap-3 flex-wrap'}>


                    <InputFile
                        name="docs"
                        maxFileSize={1000000} // 1 МБ
                        required={true}
                        label={'Verify docs, photo'}
                        helpText={'Drag and drop or click'}
                        size={'large'}
                        className={'fs-6 flex-grow-1'}
                    />
                </div>

                <InputRadioGroup
                    name="education"
                    label="Education"
                    defaultValue={0}
                    helpText={'Select your level of education.'}
                    variants={['Don\'t have', 'High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate']}
                    className={'fs-5 fcc align-items-start'}
                    classNameHelpText={'fs-7 text-left text-white-70 mb-1'}
                    classNameGroupContainer={'flex-row flex-wrap gap-1 fs-6 align-items-start justify-content-start'}
                    classNameRadioButton={'me-3'}
                />
            </div>
        </form>
    );
};

export default FormExample;
