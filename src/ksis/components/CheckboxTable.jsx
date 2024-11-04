import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../css/table";
import clsx from "clsx";

export default function CheckboxTable({
  headers,
  data,
  dataKeys,
  uniqueKey,
  selectedItems,
  setSelectedItems,
  renderActions,
  check,
  authority,
  trash,
  widthPercentage,
}) {
  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  return (
    <Table bleed className="w-full table-fixed">
      <TableHead className="border-t-2 border-[#FF9C00] bg-[#FFF9F2]">
        <TableRow>
          {check ? (
            <TableHeader className="w-1/12 p-2 text-center text-gray-800">
              <input
                type="checkbox"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectedItems(
                    isChecked
                      ? authority !== "ROLE_ADMIN"
                        ? new Set(
                            data
                              .filter((item) => item.role !== "ADMIN")
                              .map((item) => item[uniqueKey])
                          )
                        : new Set(data.map((item) => item[uniqueKey]))
                      : new Set()
                  );
                }}
              />
            </TableHeader>
          ) : null}
          {headers.map((header, index) => (
            <TableHeader
              key={index}
              // className="w-auto text-gray-800 text-center text-base font-extrabold"
              className={clsx(
                `w-${widthPercentage}/12 text-gray-800 text-center text-base font-extrabold`
              )}
            >
              {header}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item[uniqueKey]}
            className={`${
              item.role === "ADMIN" && trash !== "trash"
                ? "font-bold bg-gray-50"
                : ""
            } hover:bg-gray-100 text-base`}
          >
            {check ? (
              <TableCell className="text-center">
                {item.role === "ADMIN" && authority === "ROLE_USER" ? (
                  "📢"
                ) : (
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item[uniqueKey])}
                    onChange={() => handleCheckboxChange(item[uniqueKey])}
                  />
                )}
              </TableCell>
            ) : null}
            {dataKeys.map((key, index) => (
              <TableCell key={index} className={key.className || "text-center"}>
                {typeof key.content === "function"
                  ? key.content(item)
                  : item[key.content]}
              </TableCell>
            ))}
            {renderActions && (
              <TableCell className="text-center">
                {renderActions(item)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
