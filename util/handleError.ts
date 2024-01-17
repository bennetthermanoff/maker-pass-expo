
export const handleError = (error:any) => {
    //if 400, print message
    if (error.response?.status === 400){
        alert(error.response.data.message);
    }
    if (error.response?.status === 401){
        alert(error.response.data.message);
    }
    //if 500 or other, print error
    else {
        alert(error.response?.data?.message ?? error.message);
    }
};