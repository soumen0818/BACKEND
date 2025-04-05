class ApiResponse {
    constructor(statuscode, date, message = "success"){
        this.statuscode = statuscode
        this.date = date
        this.message = message
        this.success = statuscode < 400
    }
}

export { ApiResponse }