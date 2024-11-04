import React from "react";
import { Stack, Pagination } from "@mui/material";

const PaginationComponent = ({ totalPages, currentPage, handlePageChange }) => {
  return (
    totalPages > 0 && (
      <Stack spacing={2} className="mt-10 items-center">
        <Pagination
          shape="rounded"
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color={""}
        />
      </Stack>
    )
  );
};

export default PaginationComponent;
