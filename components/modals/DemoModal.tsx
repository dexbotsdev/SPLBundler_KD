import Text from "@/components/commons/Text";
 
function DemoModal(title:string,description:string) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden bg-background">
      {/* <img className="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains"> */}
      <div className="p-4">
        <Text size="lg">
          <b>{title}</b>
        </Text>
        <Text>
        {description}
        </Text>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          #photography
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          #travel
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          #winter
        </span>
      </div>
    </div>
  );
}

export default DemoModal;
