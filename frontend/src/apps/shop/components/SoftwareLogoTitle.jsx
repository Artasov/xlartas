import SoftwareImage from "./SoftwareImage";

const SoftwareLogoTitle = ({software, size, titleClassName, className}) => {
    return <div className={`${className}`}>
        <SoftwareImage size={size} url={software.img}/>
        <h2 className={titleClassName}>{software.name}</h2>
    </div>

}

export default SoftwareLogoTitle;