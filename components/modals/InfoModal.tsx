import Text from "@/components/commons/Text";
 
function InfoModal({title,description}:any) {
  return (
    <div className="max-w-md rounded-lg overflow-hidden bg-background">
      {/* <img className="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains"> */}
      <div className="p-4">
        <Text size="lg">
          <b>{title}</b>
        </Text>
        <Text>
        {description}
        </Text>
      </div> 
    </div>
  );
}

export default InfoModal;
